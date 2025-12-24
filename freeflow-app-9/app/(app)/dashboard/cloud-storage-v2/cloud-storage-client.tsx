'use client'

import { useState, useMemo } from 'react'
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
  Shield
} from 'lucide-react'

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

export default function CloudStorageClient() {
  const [activeTab, setActiveTab] = useState('files')
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
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
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
              <Button variant="outline" size="sm">Upgrade</Button>
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
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Folders
                    <Button variant="ghost" size="icon" className="h-6 w-6">
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
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <TabsContent value="starred" className="mt-6">
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
          <TabsContent value="shared" className="mt-6">
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
                    <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="icon" className="h-8 w-8">
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
          <TabsContent value="recent" className="mt-6">
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
          <TabsContent value="transfers" className="mt-6">
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <TabsContent value="trash" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    Deleted Files
                  </div>
                  <Button variant="outline" size="sm">
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
        </Tabs>
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
                    <Button variant="outline" size="icon">
                      {selectedFile.isStarred ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
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
                          <Button size="icon">
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
                  <Button variant="outline">
                    <Move className="w-4 h-4 mr-2" />
                    Move
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
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
