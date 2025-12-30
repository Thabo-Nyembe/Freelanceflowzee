'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Cloud,
  Upload,
  Download,
  FolderOpen,
  FileText,
  Image,
  Video,
  Music,
  Share2,
  Lock,
  Search,
  Grid3X3,
  List,
  Clock,
  Eye,
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
  Home,
  Users,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  CloudOff,
  HardDrive,
  FolderPlus,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Presentation,
  Table,
  Filter,
  SortAsc,
  Calendar,
  History,
  MessageSquare,
  Send,
  Plus,
  X,
  Check,
  Edit,
  Move,
  Folder,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  RotateCcw
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

// Import mock data from centralized adapters
import {
  cloudStorageAIInsights,
  cloudStorageCollaborators,
  cloudStoragePredictions,
  cloudStorageActivities,
  cloudStorageQuickActions
} from '@/lib/mock-data/adapters'

// Types
type FileType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'spreadsheet' | 'presentation' | 'folder' | 'other'
type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline'
type SharePermission = 'view' | 'edit' | 'comment' | 'owner'

interface CloudFile {
  id: string
  name: string
  type: FileType
  size: number
  mimeType: string
  path: string
  parentId: string | null
  isFolder: boolean
  isStarred: boolean
  isShared: boolean
  syncStatus: SyncStatus
  thumbnail: string | null
  owner: {
    id: string
    name: string
    avatar: string
  }
  sharedWith: {
    id: string
    name: string
    avatar: string
    permission: SharePermission
  }[]
  versions: number
  currentVersion: number
  createdAt: string
  modifiedAt: string
  lastAccessedAt: string
  downloadCount: number
  viewCount: number
}

interface Folder {
  id: string
  name: string
  path: string
  parentId: string | null
  color: string
  icon: string
  isTeamFolder: boolean
  itemCount: number
  size: number
  createdAt: string
  modifiedAt: string
}

interface ShareLink {
  id: string
  fileId: string
  fileName: string
  url: string
  permission: SharePermission
  password: string | null
  expiresAt: string | null
  accessCount: number
  maxAccess: number | null
  createdAt: string
  createdBy: {
    id: string
    name: string
  }
}

interface FileVersion {
  id: string
  fileId: string
  version: number
  size: number
  modifiedBy: {
    id: string
    name: string
    avatar: string
  }
  changes: string
  createdAt: string
  isCurrent: boolean
}

interface FileComment {
  id: string
  fileId: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  likes: number
  replies: FileComment[]
  createdAt: string
}

interface TransferItem {
  id: string
  fileName: string
  fileSize: number
  type: 'upload' | 'download'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused'
  progress: number
  speed: number
  startedAt: string
  completedAt: string | null
}

interface StorageQuota {
  used: number
  total: number
  breakdown: {
    type: string
    size: number
    count: number
    color: string
  }[]
}

// Mock data
const mockFiles: CloudFile[] = [
  {
    id: '1',
    name: 'Q4 Financial Report.xlsx',
    type: 'spreadsheet',
    size: 2456789,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    path: '/Documents/Finance',
    parentId: '1',
    isFolder: false,
    isStarred: true,
    isShared: true,
    syncStatus: 'synced',
    thumbnail: null,
    owner: { id: '1', name: 'Current User', avatar: '' },
    sharedWith: [
      { id: '2', name: 'Sarah Miller', avatar: '', permission: 'edit' },
      { id: '3', name: 'Mike Johnson', avatar: '', permission: 'view' }
    ],
    versions: 8,
    currentVersion: 8,
    createdAt: '2024-10-15T10:30:00Z',
    modifiedAt: '2024-12-22T14:30:00Z',
    lastAccessedAt: '2024-12-24T09:15:00Z',
    downloadCount: 45,
    viewCount: 234
  },
  {
    id: '2',
    name: 'Product Demo Video.mp4',
    type: 'video',
    size: 156789012,
    mimeType: 'video/mp4',
    path: '/Marketing/Videos',
    parentId: '2',
    isFolder: false,
    isStarred: false,
    isShared: true,
    syncStatus: 'synced',
    thumbnail: '/thumbnails/video-1.jpg',
    owner: { id: '2', name: 'Sarah Miller', avatar: '' },
    sharedWith: [{ id: '1', name: 'Current User', avatar: '', permission: 'edit' }],
    versions: 3,
    currentVersion: 3,
    createdAt: '2024-11-20T16:00:00Z',
    modifiedAt: '2024-12-18T11:45:00Z',
    lastAccessedAt: '2024-12-23T16:30:00Z',
    downloadCount: 89,
    viewCount: 456
  },
  {
    id: '3',
    name: 'Brand Guidelines.pdf',
    type: 'document',
    size: 8945678,
    mimeType: 'application/pdf',
    path: '/Marketing/Branding',
    parentId: '3',
    isFolder: false,
    isStarred: true,
    isShared: true,
    syncStatus: 'synced',
    thumbnail: '/thumbnails/pdf-1.jpg',
    owner: { id: '3', name: 'Mike Johnson', avatar: '' },
    sharedWith: [],
    versions: 5,
    currentVersion: 5,
    createdAt: '2024-06-10T09:00:00Z',
    modifiedAt: '2024-12-01T10:30:00Z',
    lastAccessedAt: '2024-12-22T11:00:00Z',
    downloadCount: 234,
    viewCount: 890
  },
  {
    id: '4',
    name: 'Project Assets.zip',
    type: 'archive',
    size: 456789012,
    mimeType: 'application/zip',
    path: '/Projects/Alpha',
    parentId: '4',
    isFolder: false,
    isStarred: false,
    isShared: false,
    syncStatus: 'syncing',
    thumbnail: null,
    owner: { id: '1', name: 'Current User', avatar: '' },
    sharedWith: [],
    versions: 1,
    currentVersion: 1,
    createdAt: '2024-12-20T15:30:00Z',
    modifiedAt: '2024-12-20T15:30:00Z',
    lastAccessedAt: '2024-12-20T15:30:00Z',
    downloadCount: 5,
    viewCount: 12
  },
  {
    id: '5',
    name: 'Team Photo.jpg',
    type: 'image',
    size: 4567890,
    mimeType: 'image/jpeg',
    path: '/Photos/Team',
    parentId: '5',
    isFolder: false,
    isStarred: false,
    isShared: true,
    syncStatus: 'synced',
    thumbnail: '/thumbnails/img-1.jpg',
    owner: { id: '4', name: 'Emma Wilson', avatar: '' },
    sharedWith: [
      { id: '1', name: 'Current User', avatar: '', permission: 'view' },
      { id: '2', name: 'Sarah Miller', avatar: '', permission: 'view' }
    ],
    versions: 2,
    currentVersion: 2,
    createdAt: '2024-08-15T14:00:00Z',
    modifiedAt: '2024-08-20T09:15:00Z',
    lastAccessedAt: '2024-12-10T16:45:00Z',
    downloadCount: 67,
    viewCount: 345
  },
  {
    id: '6',
    name: 'App Source Code',
    type: 'folder',
    size: 89012345,
    mimeType: 'folder',
    path: '/Development',
    parentId: null,
    isFolder: true,
    isStarred: true,
    isShared: true,
    syncStatus: 'synced',
    thumbnail: null,
    owner: { id: '1', name: 'Current User', avatar: '' },
    sharedWith: [{ id: '5', name: 'Alex Chen', avatar: '', permission: 'edit' }],
    versions: 0,
    currentVersion: 0,
    createdAt: '2024-01-10T08:00:00Z',
    modifiedAt: '2024-12-24T10:00:00Z',
    lastAccessedAt: '2024-12-24T10:00:00Z',
    downloadCount: 0,
    viewCount: 567
  },
  {
    id: '7',
    name: 'Presentation Deck.pptx',
    type: 'presentation',
    size: 12345678,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    path: '/Presentations',
    parentId: '6',
    isFolder: false,
    isStarred: false,
    isShared: true,
    syncStatus: 'synced',
    thumbnail: '/thumbnails/ppt-1.jpg',
    owner: { id: '2', name: 'Sarah Miller', avatar: '' },
    sharedWith: [{ id: '1', name: 'Current User', avatar: '', permission: 'comment' }],
    versions: 12,
    currentVersion: 12,
    createdAt: '2024-09-05T11:00:00Z',
    modifiedAt: '2024-12-19T15:20:00Z',
    lastAccessedAt: '2024-12-23T09:30:00Z',
    downloadCount: 156,
    viewCount: 678
  },
  {
    id: '8',
    name: 'config.json',
    type: 'code',
    size: 4567,
    mimeType: 'application/json',
    path: '/Development/Config',
    parentId: '6',
    isFolder: false,
    isStarred: false,
    isShared: false,
    syncStatus: 'error',
    thumbnail: null,
    owner: { id: '1', name: 'Current User', avatar: '' },
    sharedWith: [],
    versions: 23,
    currentVersion: 23,
    createdAt: '2024-03-20T10:00:00Z',
    modifiedAt: '2024-12-24T08:45:00Z',
    lastAccessedAt: '2024-12-24T08:45:00Z',
    downloadCount: 12,
    viewCount: 89
  }
]

const mockFolders: Folder[] = [
  { id: '1', name: 'Documents', path: '/Documents', parentId: null, color: 'blue', icon: '📄', isTeamFolder: false, itemCount: 45, size: 234567890, createdAt: '2024-01-01', modifiedAt: '2024-12-24' },
  { id: '2', name: 'Marketing', path: '/Marketing', parentId: null, color: 'purple', icon: '🎨', isTeamFolder: true, itemCount: 89, size: 567890123, createdAt: '2024-02-15', modifiedAt: '2024-12-23' },
  { id: '3', name: 'Development', path: '/Development', parentId: null, color: 'green', icon: '💻', isTeamFolder: true, itemCount: 234, size: 890123456, createdAt: '2024-01-10', modifiedAt: '2024-12-24' },
  { id: '4', name: 'Projects', path: '/Projects', parentId: null, color: 'orange', icon: '📁', isTeamFolder: false, itemCount: 67, size: 345678901, createdAt: '2024-03-01', modifiedAt: '2024-12-22' },
  { id: '5', name: 'Photos', path: '/Photos', parentId: null, color: 'pink', icon: '📷', isTeamFolder: false, itemCount: 456, size: 1234567890, createdAt: '2024-04-15', modifiedAt: '2024-12-20' },
  { id: '6', name: 'Presentations', path: '/Presentations', parentId: null, color: 'red', icon: '📊', isTeamFolder: true, itemCount: 23, size: 123456789, createdAt: '2024-05-20', modifiedAt: '2024-12-19' }
]

const mockShareLinks: ShareLink[] = [
  { id: '1', fileId: '3', fileName: 'Brand Guidelines.pdf', url: 'https://cloud.example.com/s/abc123', permission: 'view', password: null, expiresAt: '2025-01-15', accessCount: 45, maxAccess: 100, createdAt: '2024-12-01', createdBy: { id: '3', name: 'Mike Johnson' } },
  { id: '2', fileId: '7', fileName: 'Presentation Deck.pptx', url: 'https://cloud.example.com/s/def456', permission: 'comment', password: 'secure123', expiresAt: null, accessCount: 12, maxAccess: null, createdAt: '2024-12-15', createdBy: { id: '2', name: 'Sarah Miller' } },
  { id: '3', fileId: '2', fileName: 'Product Demo Video.mp4', url: 'https://cloud.example.com/s/ghi789', permission: 'view', password: null, expiresAt: '2024-12-31', accessCount: 89, maxAccess: null, createdAt: '2024-11-20', createdBy: { id: '2', name: 'Sarah Miller' } }
]

const mockVersions: FileVersion[] = [
  { id: '1', fileId: '1', version: 8, size: 2456789, modifiedBy: { id: '1', name: 'Current User', avatar: '' }, changes: 'Updated Q4 projections', createdAt: '2024-12-22T14:30:00Z', isCurrent: true },
  { id: '2', fileId: '1', version: 7, size: 2345678, modifiedBy: { id: '2', name: 'Sarah Miller', avatar: '' }, changes: 'Added expense breakdown', createdAt: '2024-12-20T10:15:00Z', isCurrent: false },
  { id: '3', fileId: '1', version: 6, size: 2234567, modifiedBy: { id: '1', name: 'Current User', avatar: '' }, changes: 'Fixed formulas in revenue sheet', createdAt: '2024-12-18T16:45:00Z', isCurrent: false },
  { id: '4', fileId: '7', version: 12, size: 12345678, modifiedBy: { id: '2', name: 'Sarah Miller', avatar: '' }, changes: 'Added new product slides', createdAt: '2024-12-19T15:20:00Z', isCurrent: true },
  { id: '5', fileId: '7', version: 11, size: 11234567, modifiedBy: { id: '1', name: 'Current User', avatar: '' }, changes: 'Updated branding colors', createdAt: '2024-12-17T11:00:00Z', isCurrent: false }
]

const mockComments: FileComment[] = [
  { id: '1', fileId: '1', content: 'Great work on the Q4 numbers! Can we add a comparison to Q3?', author: { id: '2', name: 'Sarah Miller', avatar: '' }, likes: 3, replies: [], createdAt: '2024-12-22T15:00:00Z' },
  { id: '2', fileId: '7', content: 'Love the new design! The animations are smooth.', author: { id: '3', name: 'Mike Johnson', avatar: '' }, likes: 5, replies: [], createdAt: '2024-12-20T10:30:00Z' },
  { id: '3', fileId: '3', content: 'Should we update the logo on page 5?', author: { id: '4', name: 'Emma Wilson', avatar: '' }, likes: 2, replies: [], createdAt: '2024-12-01T11:15:00Z' }
]

const mockTransfers: TransferItem[] = [
  { id: '1', fileName: 'Large_Video.mp4', fileSize: 1234567890, type: 'upload', status: 'in_progress', progress: 67, speed: 5678901, startedAt: '2024-12-24T10:00:00Z', completedAt: null },
  { id: '2', fileName: 'Project_Backup.zip', fileSize: 567890123, type: 'download', status: 'completed', progress: 100, speed: 0, startedAt: '2024-12-24T09:30:00Z', completedAt: '2024-12-24T09:45:00Z' },
  { id: '3', fileName: 'Design_Assets.psd', fileSize: 234567890, type: 'upload', status: 'paused', progress: 34, speed: 0, startedAt: '2024-12-24T09:00:00Z', completedAt: null }
]

const mockQuota: StorageQuota = {
  used: 45.6 * 1024 * 1024 * 1024,
  total: 100 * 1024 * 1024 * 1024,
  breakdown: [
    { type: 'Documents', size: 12.3 * 1024 * 1024 * 1024, count: 456, color: 'bg-blue-500' },
    { type: 'Images', size: 8.7 * 1024 * 1024 * 1024, count: 1234, color: 'bg-purple-500' },
    { type: 'Videos', size: 18.2 * 1024 * 1024 * 1024, count: 89, color: 'bg-red-500' },
    { type: 'Audio', size: 3.4 * 1024 * 1024 * 1024, count: 234, color: 'bg-green-500' },
    { type: 'Other', size: 3.0 * 1024 * 1024 * 1024, count: 567, color: 'bg-gray-500' }
  ]
}

// Enhanced Competitive Upgrade Mock Data
const mockStorageAIInsights = [
  { id: '1', type: 'success' as const, title: 'Storage Health', description: 'All files synced successfully. 99.99% uptime this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Sync' },
  { id: '2', type: 'warning' as const, title: 'Storage Quota', description: 'Using 78% of storage. Consider cleanup or upgrade.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '3', type: 'info' as const, title: 'Duplicate Files', description: '23 potential duplicate files detected. Review to save space.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
]

const mockStorageCollaborators = [
  { id: '1', name: 'IT Admin', avatar: '/avatars/it.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'Team Lead', avatar: '/avatars/lead.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'away' as const, role: 'Dev' },
]

const mockStoragePredictions = [
  { id: '1', title: 'Storage Forecast', prediction: 'At current rate, quota reached in 45 days', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Activity Pattern', prediction: 'Peak usage Tuesdays. Schedule backups accordingly.', confidence: 91, trend: 'stable' as const, impact: 'medium' as const },
]

const mockStorageActivities = [
  { id: '1', user: 'You', action: 'Uploaded', target: '15 files to Projects folder', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Team Lead', action: 'Shared', target: 'Q4 Report with team', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Completed', target: 'automatic backup', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockStorageQuickActions = [
  { id: '1', label: 'Upload Files', icon: 'upload', action: () => console.log('Upload'), variant: 'default' as const },
  { id: '2', label: 'New Folder', icon: 'folder-plus', action: () => console.log('New folder'), variant: 'default' as const },
  { id: '3', label: 'Storage Report', icon: 'bar-chart', action: () => console.log('Report'), variant: 'outline' as const },
]

export default function CloudStorageClient() {
  const [activeTab, setActiveTab] = useState('files')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null)
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [currentPath, setCurrentPath] = useState<string[]>(['Home'])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('modified')

  const filteredFiles = useMemo(() => {
    return mockFiles.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || file.type === selectedType
      return matchesSearch && matchesType
    }).sort((a, b) => {
      if (sortBy === 'modified') return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return b.size - a.size
      return 0
    })
  }, [searchQuery, selectedType, sortBy])

  const starredFiles = useMemo(() => mockFiles.filter(f => f.isStarred), [])
  const recentFiles = useMemo(() =>
    [...mockFiles].sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()).slice(0, 5),
  [])
  const sharedFiles = useMemo(() => mockFiles.filter(f => f.isShared), [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'document': return FileText
      case 'image': return FileImage
      case 'video': return FileVideo
      case 'audio': return FileAudio
      case 'archive': return FileArchive
      case 'code': return FileCode
      case 'spreadsheet': return Table
      case 'presentation': return Presentation
      case 'folder': return Folder
      default: return File
    }
  }

  const getFileColor = (type: FileType) => {
    switch (type) {
      case 'document': return 'text-blue-500 bg-blue-100 dark:bg-blue-900'
      case 'image': return 'text-purple-500 bg-purple-100 dark:bg-purple-900'
      case 'video': return 'text-red-500 bg-red-100 dark:bg-red-900'
      case 'audio': return 'text-green-500 bg-green-100 dark:bg-green-900'
      case 'archive': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900'
      case 'code': return 'text-gray-500 bg-gray-100 dark:bg-gray-700'
      case 'spreadsheet': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900'
      case 'presentation': return 'text-orange-500 bg-orange-100 dark:bg-orange-900'
      case 'folder': return 'text-sky-500 bg-sky-100 dark:bg-sky-900'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getSyncIcon = (status: SyncStatus) => {
    switch (status) {
      case 'synced': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'offline': return <CloudOff className="w-4 h-4 text-gray-500" />
      default: return null
    }
  }

  const openFileDialog = (file: CloudFile) => {
    setSelectedFile(file)
    setShowFileDialog(true)
  }

  const usedPercentage = (mockQuota.used / mockQuota.total) * 100

  // Handlers
  const handleUploadFile = () => {
    toast.info('Upload File', { description: 'Opening file picker...' })
  }
  const handleCreateFolder = () => {
    toast.info('Create Folder', { description: 'Creating new folder...' })
  }
  const handleShareFile = (fileName: string) => {
    toast.success('Link Created', { description: `Share link for "${fileName}" copied to clipboard` })
  }
  const handleDownloadFile = (fileName: string) => {
    toast.success('Download Started', { description: `Downloading "${fileName}"...` })
  }
  const handleDeleteFile = (fileName: string) => {
    toast.info('File Deleted', { description: `"${fileName}" moved to trash` })
  }
  const handleFilter = () => {
    toast.info('Filter', { description: 'Opening filter options...' })
  }
  const handleUpgrade = () => {
    toast.info('Upgrade Storage', { description: 'Opening upgrade options...' })
  }
  const handleMove = (fileName: string) => {
    toast.info('Move File', { description: `Selecting destination for "${fileName}"...` })
  }
  const handleCopy = (fileName: string) => {
    toast.info('Copy File', { description: `Creating copy of "${fileName}"...` })
  }
  const handleSync = () => {
    toast.info('Sync', { description: 'Syncing files...' })
  }
  const handleScan = () => {
    toast.info('Scan', { description: 'Scanning for changes...' })
  }
  const handleMoreOptions = (fileName: string) => {
    toast.info('More Options', { description: `Options for "${fileName}"` })
  }
  const handleCopyLink = (url: string) => {
    toast.success('Link Copied', { description: 'Share link copied to clipboard' })
  }
  const handleCancelTransfer = (fileName: string) => {
    toast.info('Transfer Cancelled', { description: `Cancelled transfer for "${fileName}"` })
  }
  const handleRetentionPolicy = () => {
    toast.info('Retention Policy', { description: 'Opening retention settings...' })
  }
  const handleRestoreAll = () => {
    toast.info('Restore All', { description: 'Restoring all deleted files...' })
  }
  const handleEmptyTrash = () => {
    toast.info('Empty Trash', { description: 'Permanently deleting all files in trash...' })
  }
  const handleSearchTrash = () => {
    toast.info('Search Trash', { description: 'Searching deleted files...' })
  }
  const handleAutoDelete = () => {
    toast.info('Auto-Delete Settings', { description: 'Opening retention settings...' })
  }
  const handleExportData = () => {
    toast.info('Export Data', { description: 'Preparing data export...' })
  }
  const handlePauseSync = () => {
    toast.info('Sync Paused', { description: 'File synchronization paused' })
  }
  const handleClearCache = () => {
    toast.info('Cache Cleared', { description: 'All cached data has been removed' })
  }
  const handleDeleteAllFiles = () => {
    toast.info('Delete All', { description: 'This action requires confirmation' })
  }
  const handleToggleStar = (fileName: string, isStarred: boolean) => {
    toast.success(isStarred ? 'Removed from Starred' : 'Added to Starred', { description: `"${fileName}" ${isStarred ? 'removed from' : 'added to'} starred files` })
  }
  const handleSendComment = () => {
    toast.success('Comment Sent', { description: 'Your comment has been posted' })
  }
  const handleOpenFile = (fileName: string) => {
    toast.info('Opening File', { description: `Opening "${fileName}"...` })
  }
  const handleCreateLink = () => {
    toast.info('Create Link', { description: 'Creating shareable link...' })
  }

  const stats = [
    { label: 'Storage Used', value: formatSize(mockQuota.used), icon: HardDrive, change: '+2.3 GB', color: 'text-blue-600' },
    { label: 'Total Files', value: mockFiles.length.toString(), icon: File, change: '+12', color: 'text-indigo-600' },
    { label: 'Shared Files', value: sharedFiles.length.toString(), icon: Share2, change: '+5', color: 'text-green-600' },
    { label: 'Team Folders', value: mockFolders.filter(f => f.isTeamFolder).length.toString(), icon: Users, change: '+1', color: 'text-purple-600' },
    { label: 'Active Shares', value: mockShareLinks.length.toString(), icon: LinkIcon, change: '+3', color: 'text-cyan-600' },
    { label: 'Downloads', value: '1.2K', icon: Download, change: '+156', color: 'text-pink-600' },
    { label: 'Sync Status', value: '98%', icon: RefreshCw, change: '+2%', color: 'text-orange-600' },
    { label: 'Comments', value: mockComments.length.toString(), icon: MessageSquare, change: '+8', color: 'text-teal-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cloud Storage</h1>
              <p className="text-gray-500 dark:text-gray-400">Dropbox-level file management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-80"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleFilter}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white" onClick={handleUploadFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Storage Quota */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-sky-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Storage</h3>
                  <p className="text-sm text-gray-500">{formatSize(mockQuota.used)} of {formatSize(mockQuota.total)} used</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleUpgrade}>Upgrade</Button>
            </div>
            <Progress value={usedPercentage} className="h-3 mb-4" />
            <div className="flex items-center gap-4 flex-wrap">
              {mockQuota.breakdown.map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.type}: {formatSize(item.size)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border shadow-sm">
            <TabsTrigger value="files" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <FolderOpen className="w-4 h-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger value="starred" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <Star className="w-4 h-4 mr-2" />
              Starred
            </TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <Share2 className="w-4 h-4 mr-2" />
              Shared
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="transfers" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <Activity className="w-4 h-4 mr-2" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="trash" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <Trash2 className="w-4 h-4 mr-2" />
              Trash
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-sky-100 dark:data-[state=active]:bg-sky-900">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-6 space-y-6">
            {/* Files Overview Banner */}
            <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Cloud className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">My Files</h2>
                    <p className="text-sky-100">All your files in one secure location • {stats.storageUsed.toFixed(1)} GB used</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalFiles}</p>
                    <p className="text-sm text-sky-200">Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalFolders}</p>
                    <p className="text-sm text-sky-200">Folders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.sharedFiles}</p>
                    <p className="text-sm text-sky-200">Shared</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'Upload', icon: Upload, color: 'from-sky-500 to-blue-500', onClick: handleUploadFile },
                { label: 'New Folder', icon: FolderPlus, color: 'from-indigo-500 to-purple-500', onClick: handleCreateFolder },
                { label: 'Share', icon: Share2, color: 'from-green-500 to-emerald-500', onClick: () => handleShareFile('Selected file') },
                { label: 'Download', icon: Download, color: 'from-orange-500 to-red-500', onClick: () => handleDownloadFile('Selected file') },
                { label: 'Move', icon: Move, color: 'from-purple-500 to-pink-500', onClick: () => handleMove('Selected file') },
                { label: 'Copy', icon: Copy, color: 'from-teal-500 to-cyan-500', onClick: () => handleCopy('Selected file') },
                { label: 'Sync', icon: RefreshCw, color: 'from-blue-500 to-indigo-500', onClick: handleSync },
                { label: 'Scan', icon: FileText, color: 'from-gray-500 to-gray-600', onClick: handleScan }
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all group"
                  onClick={action.onClick}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Folders
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateFolder}>
                      <FolderPlus className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {mockFolders.map(folder => (
                    <button
                      key={folder.id}
                      className="w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-left transition-colors"
                    >
                      <span className="text-xl">{folder.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{folder.name}</div>
                        <div className="text-xs text-gray-500">{folder.itemCount} items</div>
                      </div>
                      {folder.isTeamFolder && <Users className="w-4 h-4 text-purple-500" />}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Files Grid */}
              <div className="lg:col-span-3 space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentPath.map((path, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}
                        <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-sky-600">
                          {path}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700"
                    >
                      <option value="all">All Types</option>
                      <option value="document">Documents</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="folder">Folders</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700"
                    >
                      <option value="modified">Last Modified</option>
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                    </select>
                    <div className="flex gap-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Files */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredFiles.map(file => {
                      const FileIcon = getFileIcon(file.type)
                      return (
                        <Card
                          key={file.id}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => openFileDialog(file)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 relative overflow-hidden">
                              {file.thumbnail ? (
                                <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className={`w-12 h-12 rounded-lg ${getFileColor(file.type)} flex items-center justify-center`}>
                                  <FileIcon className="w-6 h-6" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex items-center gap-1">
                                {getSyncIcon(file.syncStatus)}
                                {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                              </div>
                            </div>
                            <h4 className="font-medium text-sm truncate mb-1">{file.name}</h4>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatSize(file.size)}</span>
                              <span>{formatDate(file.modifiedAt)}</span>
                            </div>
                            {file.isShared && (
                              <div className="flex items-center gap-1 mt-2">
                                <div className="flex -space-x-2">
                                  {file.sharedWith.slice(0, 3).map(user => (
                                    <Avatar key={user.id} className="w-5 h-5 border-2 border-white">
                                      <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                {file.sharedWith.length > 3 && (
                                  <span className="text-xs text-gray-500">+{file.sharedWith.length - 3}</span>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <div className="divide-y dark:divide-gray-700">
                      {filteredFiles.map(file => {
                        const FileIcon = getFileIcon(file.type)
                        return (
                          <div
                            key={file.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex items-center gap-4"
                            onClick={() => openFileDialog(file)}
                          >
                            <div className={`w-10 h-10 rounded-lg ${getFileColor(file.type)} flex items-center justify-center`}>
                              <FileIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm truncate">{file.name}</h4>
                                {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                {getSyncIcon(file.syncStatus)}
                              </div>
                              <div className="text-xs text-gray-500">{file.path}</div>
                            </div>
                            <div className="text-sm text-gray-500">{formatSize(file.size)}</div>
                            <div className="text-sm text-gray-500">{formatDate(file.modifiedAt)}</div>
                            {file.isShared && (
                              <div className="flex -space-x-2">
                                {file.sharedWith.slice(0, 3).map(user => (
                                  <Avatar key={user.id} className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleMoreOptions(file.name) }}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Starred Tab */}
          <TabsContent value="starred" className="mt-6 space-y-6">
            {/* Starred Banner */}
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Star className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Starred Files</h2>
                    <p className="text-yellow-100">Quick access to your important files</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{starredFiles.length}</p>
                  <p className="text-sm text-yellow-200">Starred</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {starredFiles.map(file => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <Card
                    key={file.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => openFileDialog(file)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 relative">
                        <div className={`w-12 h-12 rounded-lg ${getFileColor(file.type)} flex items-center justify-center`}>
                          <FileIcon className="w-6 h-6" />
                        </div>
                        <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <h4 className="font-medium text-sm truncate">{file.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(file.modifiedAt)}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared" className="mt-6 space-y-6">
            {/* Shared Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Share2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Shared Files</h2>
                    <p className="text-green-100">Files shared with you and by you</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.sharedFiles}</p>
                    <p className="text-sm text-green-200">Shared</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockFiles.filter(f => f.sharedWith.length > 0).length}</p>
                    <p className="text-sm text-green-200">By Me</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Shared with Me</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sharedFiles.filter(f => f.owner.id !== '1').map(file => {
                    const FileIcon = getFileIcon(file.type)
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg ${getFileColor(file.type)} flex items-center justify-center`}>
                          <FileIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">Shared by {file.owner.name}</div>
                        </div>
                        <Badge variant="outline">{file.sharedWith.find(s => s.id === '1')?.permission || 'view'}</Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Active Share Links
                    <Button variant="outline" size="sm" onClick={handleCreateLink}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Link
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockShareLinks.map(link => (
                    <div key={link.id} className="p-3 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm truncate">{link.fileName}</div>
                        <Badge variant="outline">{link.permission}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Input value={link.url} readOnly className="text-xs h-8" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopyLink(link.url)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{link.accessCount} views</span>
                        {link.expiresAt && <span>Expires {formatDate(link.expiresAt)}</span>}
                        {link.password && <Lock className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="mt-6 space-y-6">
            {/* Recent Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Clock className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Recent Files</h2>
                    <p className="text-purple-100">Files you recently viewed or modified</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{mockFiles.length}</p>
                  <p className="text-sm text-purple-200">Recent</p>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Recently Accessed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentFiles.map(file => {
                    const FileIcon = getFileIcon(file.type)
                    return (
                      <div
                        key={file.id}
                        className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => openFileDialog(file)}
                      >
                        <div className={`w-10 h-10 rounded-lg ${getFileColor(file.type)} flex items-center justify-center`}>
                          <FileIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{file.name}</h4>
                          <p className="text-xs text-gray-500">{file.path}</p>
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(file.lastAccessedAt)}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="mt-6 space-y-6">
            {/* Transfers Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Transfers</h2>
                    <p className="text-orange-100">Monitor uploads and downloads in progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTransfers.filter(t => t.status === 'uploading' || t.status === 'downloading').length}</p>
                    <p className="text-sm text-orange-200">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTransfers.filter(t => t.status === 'completed').length}</p>
                    <p className="text-sm text-orange-200">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  Active Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTransfers.map(transfer => (
                  <div key={transfer.id} className="p-4 rounded-lg border dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {transfer.type === 'upload' ? (
                          <Upload className="w-5 h-5 text-sky-500" />
                        ) : (
                          <Download className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{transfer.fileName}</div>
                          <div className="text-xs text-gray-500">{formatSize(transfer.fileSize)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transfer.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          transfer.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          transfer.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {transfer.status.replace('_', ' ')}
                        </Badge>
                        {transfer.status === 'in_progress' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCancelTransfer(transfer.fileName)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {transfer.status !== 'completed' && (
                      <div className="space-y-1">
                        <Progress value={transfer.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{transfer.progress}%</span>
                          {transfer.speed > 0 && <span>{formatSize(transfer.speed)}/s</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trash Tab */}
          <TabsContent value="trash" className="mt-6 space-y-6">
            {/* Trash Overview Banner */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Trash</h2>
                    <p className="text-red-100">Recover deleted files within 30 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Empty</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleRetentionPolicy}>
                    <Clock className="h-4 w-4 mr-2" />
                    Retention Policy
                  </Button>
                </div>
              </div>
            </div>

            {/* Trash Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: RotateCcw, label: 'Restore All', desc: 'Recover all files', color: 'text-green-500', onClick: handleRestoreAll },
                { icon: Trash2, label: 'Empty Trash', desc: 'Delete permanently', color: 'text-red-500', onClick: handleEmptyTrash },
                { icon: Search, label: 'Search Trash', desc: 'Find deleted files', color: 'text-blue-500', onClick: handleSearchTrash },
                { icon: Clock, label: 'Auto-Delete', desc: 'Retention settings', color: 'text-purple-500', onClick: handleAutoDelete },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-white/80 dark:bg-gray-800/80" onClick={action.onClick}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    Deleted Files
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEmptyTrash}>
                    Empty Trash
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trash is Empty</h3>
                  <p className="text-gray-500">Deleted files will appear here for 30 days</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Storage Settings</h2>
                    <p className="text-gray-300">Configure sync, sharing, and storage preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Synced</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'sync', icon: RefreshCw, label: 'Sync', desc: 'Sync options' },
                        { id: 'sharing', icon: Share2, label: 'Sharing', desc: 'Share settings' },
                        { id: 'security', icon: Shield, label: 'Security', desc: 'Protection' },
                        { id: 'notifications', icon: AlertCircle, label: 'Notifications', desc: 'Alert prefs' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                            settingsTab === item.id
                              ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-sky-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Name</label>
                        <Input defaultValue="My Cloud Storage" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default View</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Grid View</option>
                          <option>List View</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Hidden Files</p>
                          <p className="text-sm text-gray-500">Display files starting with dot</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show File Extensions</p>
                          <p className="text-sm text-gray-500">Display file type extensions</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Thumbnails</p>
                          <p className="text-sm text-gray-500">Generate previews for images and videos</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Confirm Before Delete</p>
                          <p className="text-sm text-gray-500">Ask before moving files to trash</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sync Settings */}
                {settingsTab === 'sync' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                        Sync Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-sync</p>
                          <p className="text-sm text-gray-500">Automatically sync files when changes detected</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sync on WiFi Only</p>
                          <p className="text-sm text-gray-500">Pause sync on mobile data</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sync Frequency</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Real-time</option>
                          <option>Every 5 minutes</option>
                          <option>Every 15 minutes</option>
                          <option>Every hour</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Selective Sync</p>
                          <p className="text-sm text-gray-500">Choose specific folders to sync</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Smart Sync</p>
                          <p className="text-sm text-gray-500">Download files only when accessed</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Pause Sync</p>
                          <p className="text-sm text-gray-500">Temporarily stop all sync activities</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePauseSync}>Pause</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sharing Settings */}
                {settingsTab === 'sharing' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-purple-600" />
                        Sharing Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Share Permission</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>View Only</option>
                          <option>Can Comment</option>
                          <option>Can Edit</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Public Links</p>
                          <p className="text-sm text-gray-500">Create shareable links anyone can access</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Link Expiration</p>
                          <p className="text-sm text-gray-500">Auto-expire shared links after time</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Password Protect Links</p>
                          <p className="text-sm text-gray-500">Require password to access shared files</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Download Permission</p>
                          <p className="text-sm text-gray-500">Allow viewers to download shared files</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Track Link Views</p>
                          <p className="text-sm text-gray-500">Log when shared links are accessed</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Require 2FA for account access</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Encryption at Rest</p>
                          <p className="text-sm text-gray-500">Encrypt stored files</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">AES-256</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">End-to-End Encryption</p>
                          <p className="text-sm text-gray-500">Zero-knowledge encryption for sensitive files</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Remote Wipe</p>
                          <p className="text-sm text-gray-500">Allow remote data deletion</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Activity Logging</p>
                          <p className="text-sm text-gray-500">Track all file access and changes</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'File Uploads', desc: 'Notify when uploads complete', enabled: true },
                        { label: 'File Downloads', desc: 'Notify when downloads complete', enabled: false },
                        { label: 'Sharing Activity', desc: 'When files are shared with you', enabled: true },
                        { label: 'Comments', desc: 'When someone comments on your files', enabled: true },
                        { label: 'Storage Alerts', desc: 'When storage is almost full', enabled: true },
                        { label: 'Sync Errors', desc: 'When sync issues occur', enabled: true },
                        { label: 'Security Alerts', desc: 'Suspicious activity detected', enabled: true },
                      ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                            <p className="text-sm text-gray-500">{setting.desc}</p>
                          </div>
                          <input type="checkbox" className="w-5 h-5" defaultChecked={setting.enabled} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trash Retention</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>7 days</option>
                          <option>30 days</option>
                          <option>90 days</option>
                          <option>Forever</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">File Versioning</p>
                          <p className="text-sm text-gray-500">Keep previous versions of files</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Duplicate Detection</p>
                          <p className="text-sm text-gray-500">Warn when uploading duplicate files</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">API Access</p>
                          <p className="text-sm text-gray-500">Enable third-party app access</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Debug Mode</p>
                          <p className="text-sm text-gray-500">Enable verbose logging</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Clear All Caches</p>
                              <p className="text-sm text-red-600">Remove all cached data</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={handleClearCache}>
                              Clear
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Files</p>
                              <p className="text-sm text-red-600">Permanently delete all stored files</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={handleDeleteAllFiles}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockStorageAIInsights}
              title="Storage Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockStorageCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockStoragePredictions}
              title="Storage Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockStorageActivities}
            title="Storage Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockStorageQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* File Detail Dialog */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedFile && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${getFileColor(selectedFile.type)} flex items-center justify-center`}>
                      {(() => {
                        const Icon = getFileIcon(selectedFile.type)
                        return <Icon className="w-6 h-6" />
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedFile.name}</DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{selectedFile.path}</span>
                        <span>•</span>
                        <span>{formatSize(selectedFile.size)}</span>
                        {getSyncIcon(selectedFile.syncStatus)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleToggleStar(selectedFile.name, selectedFile.isStarred)}>
                      {selectedFile.isStarred ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShareFile(selectedFile.name)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownloadFile(selectedFile.name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleMoreOptions(selectedFile.name)}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] mt-4">
                <div className="space-y-6 pr-4">
                  {/* Preview */}
                  <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {selectedFile.thumbnail ? (
                      <img src={selectedFile.thumbnail} alt={selectedFile.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className={`w-24 h-24 rounded-xl ${getFileColor(selectedFile.type)} flex items-center justify-center`}>
                        {(() => {
                          const Icon = getFileIcon(selectedFile.type)
                          return <Icon className="w-12 h-12" />
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Views</div>
                      <div className="text-xl font-semibold">{selectedFile.viewCount}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Downloads</div>
                      <div className="text-xl font-semibold">{selectedFile.downloadCount}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Version</div>
                      <div className="text-xl font-semibold">{selectedFile.currentVersion}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Shared With</div>
                      <div className="text-xl font-semibold">{selectedFile.sharedWith.length}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="font-semibold mb-3">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span className="capitalize">{selectedFile.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span>{formatSize(selectedFile.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span>{new Date(selectedFile.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Modified</span>
                        <span>{new Date(selectedFile.modifiedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Owner</span>
                        <span>{selectedFile.owner.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sharing */}
                  {selectedFile.sharedWith.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Shared With</h3>
                      <div className="space-y-2">
                        {selectedFile.sharedWith.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{user.name}</span>
                            </div>
                            <Badge variant="outline">{user.permission}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Version History */}
                  {selectedFile.versions > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Version History
                      </h3>
                      <div className="space-y-2">
                        {mockVersions.filter(v => v.fileId === selectedFile.id).map(version => (
                          <div key={version.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{version.modifiedBy.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">v{version.version}</span>
                                {version.isCurrent && <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>}
                              </div>
                              <div className="text-xs text-gray-500">{version.changes}</div>
                            </div>
                            <div className="text-xs text-gray-500">{formatDate(version.createdAt)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Comments
                    </h3>
                    <div className="space-y-3">
                      {mockComments.filter(c => c.fileId === selectedFile.id).map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar>
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{comment.author.name}</span>
                              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>Y</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input placeholder="Add a comment..." className="flex-1" />
                          <Button size="icon" onClick={handleSendComment}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => handleMove(selectedFile.name)}>
                    <Move className="w-4 h-4 mr-2" />
                    Move
                  </Button>
                  <Button variant="outline" onClick={() => handleCopy(selectedFile.name)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteFile(selectedFile.name)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white" onClick={() => handleOpenFile(selectedFile.name)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
