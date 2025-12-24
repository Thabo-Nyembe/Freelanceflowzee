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
  FolderOpen,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Upload,
  Share2,
  Star,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Grid3x3,
  List,
  FolderPlus,
  Plus,
  Settings,
  Clock,
  HardDrive,
  Cloud,
  Users,
  Link2,
  Lock,
  Unlock,
  Eye,
  Edit,
  Copy,
  Move,
  ChevronRight,
  ChevronDown,
  Home,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  History,
  Layers,
  Bookmark,
  Tag,
  Bell,
  HelpCircle,
  Info
} from 'lucide-react'

// Types
type FileType = 'folder' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'spreadsheet' | 'presentation' | 'other'
type FileStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline'
type ShareAccess = 'view' | 'edit' | 'full'
type SortBy = 'name' | 'modified' | 'size' | 'type'

interface FileItem {
  id: string
  name: string
  type: FileType
  size: number
  path: string
  parentId: string | null
  createdAt: string
  modifiedAt: string
  owner: string
  status: FileStatus
  isStarred: boolean
  isShared: boolean
  shareCount?: number
  thumbnail?: string
  extension?: string
  version?: number
  tags?: string[]
}

interface FolderItem {
  id: string
  name: string
  parentId: string | null
  path: string
  itemCount: number
  size: number
  createdAt: string
  modifiedAt: string
  color?: string
  isShared: boolean
}

interface SharedLink {
  id: string
  fileId: string
  fileName: string
  access: ShareAccess
  createdAt: string
  expiresAt?: string
  viewCount: number
  downloadCount: number
  isPasswordProtected: boolean
}

interface FileActivity {
  id: string
  fileId: string
  fileName: string
  action: 'created' | 'modified' | 'deleted' | 'shared' | 'downloaded' | 'moved' | 'renamed'
  user: string
  timestamp: string
}

interface StorageStats {
  totalSpace: number
  usedSpace: number
  fileCount: number
  folderCount: number
  sharedFiles: number
  starredFiles: number
  recentFiles: number
  trashedFiles: number
}

// Mock data
const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Project Proposal.docx',
    type: 'document',
    size: 2456000,
    path: '/Documents/Work',
    parentId: 'folder-1',
    createdAt: '2024-12-20T10:30:00Z',
    modifiedAt: '2024-12-24T08:15:00Z',
    owner: 'John Doe',
    status: 'synced',
    isStarred: true,
    isShared: true,
    shareCount: 3,
    extension: 'docx',
    version: 5,
    tags: ['work', 'important']
  },
  {
    id: '2',
    name: 'Financial Report Q4.xlsx',
    type: 'spreadsheet',
    size: 1834000,
    path: '/Documents/Finance',
    parentId: 'folder-2',
    createdAt: '2024-12-18T14:20:00Z',
    modifiedAt: '2024-12-23T16:45:00Z',
    owner: 'John Doe',
    status: 'synced',
    isStarred: true,
    isShared: true,
    shareCount: 5,
    extension: 'xlsx',
    version: 3,
    tags: ['finance', 'quarterly']
  },
  {
    id: '3',
    name: 'Team Photo.jpg',
    type: 'image',
    size: 4567000,
    path: '/Photos/Team',
    parentId: 'folder-3',
    createdAt: '2024-12-15T09:00:00Z',
    modifiedAt: '2024-12-15T09:00:00Z',
    owner: 'Sarah Chen',
    status: 'synced',
    isStarred: false,
    isShared: false,
    extension: 'jpg',
    version: 1
  },
  {
    id: '4',
    name: 'Product Demo.mp4',
    type: 'video',
    size: 156780000,
    path: '/Videos/Marketing',
    parentId: 'folder-4',
    createdAt: '2024-12-12T11:30:00Z',
    modifiedAt: '2024-12-22T10:00:00Z',
    owner: 'Mike Johnson',
    status: 'syncing',
    isStarred: true,
    isShared: true,
    shareCount: 8,
    extension: 'mp4',
    version: 2,
    tags: ['marketing', 'demo']
  },
  {
    id: '5',
    name: 'Brand Guidelines.pdf',
    type: 'document',
    size: 8934000,
    path: '/Documents/Brand',
    parentId: 'folder-1',
    createdAt: '2024-11-28T15:45:00Z',
    modifiedAt: '2024-12-20T09:30:00Z',
    owner: 'Emma Davis',
    status: 'synced',
    isStarred: true,
    isShared: true,
    shareCount: 12,
    extension: 'pdf',
    version: 4,
    tags: ['brand', 'guidelines']
  },
  {
    id: '6',
    name: 'Podcast Episode 15.mp3',
    type: 'audio',
    size: 45670000,
    path: '/Audio/Podcasts',
    parentId: 'folder-5',
    createdAt: '2024-12-10T16:00:00Z',
    modifiedAt: '2024-12-10T16:00:00Z',
    owner: 'John Doe',
    status: 'synced',
    isStarred: false,
    isShared: false,
    extension: 'mp3',
    version: 1
  },
  {
    id: '7',
    name: 'Source Code.zip',
    type: 'archive',
    size: 23456000,
    path: '/Code/Backup',
    parentId: 'folder-6',
    createdAt: '2024-12-08T12:00:00Z',
    modifiedAt: '2024-12-21T18:30:00Z',
    owner: 'Alex Thompson',
    status: 'synced',
    isStarred: false,
    isShared: false,
    extension: 'zip',
    version: 7,
    tags: ['code', 'backup']
  },
  {
    id: '8',
    name: 'Q4 Presentation.pptx',
    type: 'presentation',
    size: 12340000,
    path: '/Documents/Presentations',
    parentId: 'folder-1',
    createdAt: '2024-12-19T10:15:00Z',
    modifiedAt: '2024-12-24T07:00:00Z',
    owner: 'John Doe',
    status: 'pending',
    isStarred: true,
    isShared: true,
    shareCount: 6,
    extension: 'pptx',
    version: 8,
    tags: ['presentation', 'quarterly']
  }
]

const mockFolders: FolderItem[] = [
  { id: 'folder-1', name: 'Documents', parentId: null, path: '/Documents', itemCount: 45, size: 234567000, createdAt: '2024-01-15', modifiedAt: '2024-12-24', color: 'blue', isShared: true },
  { id: 'folder-2', name: 'Finance', parentId: 'folder-1', path: '/Documents/Finance', itemCount: 12, size: 45678000, createdAt: '2024-03-20', modifiedAt: '2024-12-23', color: 'green', isShared: true },
  { id: 'folder-3', name: 'Photos', parentId: null, path: '/Photos', itemCount: 234, size: 567890000, createdAt: '2024-02-10', modifiedAt: '2024-12-22', color: 'purple', isShared: false },
  { id: 'folder-4', name: 'Videos', parentId: null, path: '/Videos', itemCount: 28, size: 2345670000, createdAt: '2024-04-05', modifiedAt: '2024-12-21', color: 'red', isShared: true },
  { id: 'folder-5', name: 'Audio', parentId: null, path: '/Audio', itemCount: 56, size: 890123000, createdAt: '2024-05-12', modifiedAt: '2024-12-20', color: 'orange', isShared: false },
  { id: 'folder-6', name: 'Code', parentId: null, path: '/Code', itemCount: 89, size: 123456000, createdAt: '2024-06-08', modifiedAt: '2024-12-19', color: 'cyan', isShared: false }
]

const mockSharedLinks: SharedLink[] = [
  { id: '1', fileId: '1', fileName: 'Project Proposal.docx', access: 'edit', createdAt: '2024-12-20', viewCount: 45, downloadCount: 12, isPasswordProtected: false },
  { id: '2', fileId: '2', fileName: 'Financial Report Q4.xlsx', access: 'view', createdAt: '2024-12-18', expiresAt: '2024-12-31', viewCount: 89, downloadCount: 23, isPasswordProtected: true },
  { id: '3', fileId: '5', fileName: 'Brand Guidelines.pdf', access: 'view', createdAt: '2024-12-15', viewCount: 156, downloadCount: 67, isPasswordProtected: false }
]

const mockActivity: FileActivity[] = [
  { id: '1', fileId: '1', fileName: 'Project Proposal.docx', action: 'modified', user: 'John Doe', timestamp: '2024-12-24T08:15:00Z' },
  { id: '2', fileId: '8', fileName: 'Q4 Presentation.pptx', action: 'shared', user: 'Sarah Chen', timestamp: '2024-12-24T07:30:00Z' },
  { id: '3', fileId: '4', fileName: 'Product Demo.mp4', action: 'downloaded', user: 'Mike Johnson', timestamp: '2024-12-23T16:45:00Z' },
  { id: '4', fileId: '2', fileName: 'Financial Report Q4.xlsx', action: 'modified', user: 'Emma Davis', timestamp: '2024-12-23T14:20:00Z' },
  { id: '5', fileId: '7', fileName: 'Source Code.zip', action: 'created', user: 'Alex Thompson', timestamp: '2024-12-21T18:30:00Z' }
]

// Helper functions
const getFileIcon = (type: FileType) => {
  const icons = {
    folder: FolderOpen,
    document: FileText,
    image: Image,
    video: Video,
    audio: Music,
    archive: Archive,
    code: FileText,
    spreadsheet: FileText,
    presentation: FileText,
    other: File
  }
  return icons[type]
}

const getFileColor = (type: FileType) => {
  const colors = {
    folder: 'text-blue-500',
    document: 'text-blue-600',
    image: 'text-green-500',
    video: 'text-purple-500',
    audio: 'text-orange-500',
    archive: 'text-yellow-600',
    code: 'text-emerald-500',
    spreadsheet: 'text-green-600',
    presentation: 'text-red-500',
    other: 'text-gray-500'
  }
  return colors[type]
}

const getStatusColor = (status: FileStatus) => {
  const colors = {
    synced: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    syncing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    offline: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[status]
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function FilesHubClient() {
  const [activeTab, setActiveTab] = useState('files')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('modified')
  const [filterType, setFilterType] = useState<FileType | 'all'>('all')

  // Stats
  const stats: StorageStats = useMemo(() => ({
    totalSpace: 15 * 1024 * 1024 * 1024, // 15 GB
    usedSpace: mockFiles.reduce((sum, f) => sum + f.size, 0) + mockFolders.reduce((sum, f) => sum + f.size, 0),
    fileCount: mockFiles.length,
    folderCount: mockFolders.length,
    sharedFiles: mockFiles.filter(f => f.isShared).length,
    starredFiles: mockFiles.filter(f => f.isStarred).length,
    recentFiles: mockFiles.filter(f => new Date(f.modifiedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    trashedFiles: 0
  }), [])

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    let files = mockFiles.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || file.type === filterType
      const matchesFolder = currentFolderId === null || file.parentId === currentFolderId
      return matchesSearch && matchesType && matchesFolder
    })

    // Sort
    files.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'modified':
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        case 'size':
          return b.size - a.size
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return files
  }, [searchQuery, filterType, currentFolderId, sortBy])

  const currentFolders = useMemo(() => {
    return mockFolders.filter(f => f.parentId === currentFolderId)
  }, [currentFolderId])

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ id: null, name: 'Home' }]
    if (currentFolderId) {
      const folder = mockFolders.find(f => f.id === currentFolderId)
      if (folder) {
        crumbs.push({ id: folder.id, name: folder.name })
      }
    }
    return crumbs
  }, [currentFolderId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Files Hub
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dropbox-level cloud storage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-4 h-4 text-cyan-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Storage</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatSize(stats.usedSpace)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>of {formatSize(stats.totalSpace)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <File className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Files</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.fileCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+12 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Folders</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.folderCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <span>Organized</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Shared</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.sharedFiles}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <span>With team</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Starred</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.starredFiles}
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <span>Quick access</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Recent</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.recentFiles}
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <span>This week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Links</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {mockSharedLinks.length}
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-600">
                <span>Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Trash</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.trashedFiles}
              </div>
              <div className="flex items-center gap-1 text-xs text-red-600">
                <span>Items</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage Bar */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Usage</span>
              <span className="text-sm text-gray-500">{formatSize(stats.usedSpace)} / {formatSize(stats.totalSpace)}</span>
            </div>
            <Progress value={(stats.usedSpace / stats.totalSpace) * 100} className="h-2" />
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Documents</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Images</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Videos</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Audio</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Other</span>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search files and folders..."
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
              className={viewMode === 'grid' ? 'bg-cyan-100' : ''}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-cyan-100' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1">
            <TabsTrigger value="files" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
              <FolderOpen className="w-4 h-4 mr-2" />
              All Files
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="starred" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
              <Star className="w-4 h-4 mr-2" />
              Starred
            </TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
              <Share2 className="w-4 h-4 mr-2" />
              Shared
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
              <History className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, i) => (
                <div key={crumb.id || 'home'} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-4 h-4" />}
                  <button
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className="hover:text-cyan-600 transition-colors"
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Folders */}
            {currentFolders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <FolderOpen className={`w-12 h-12 mx-auto mb-2 text-${folder.color || 'blue'}-500`} />
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{folder.name}</h3>
                      <p className="text-xs text-gray-500">{folder.itemCount} items</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Files */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <Card
                    key={file.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedFile(file)
                      setShowFileDialog(true)
                    }}
                  >
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3'}>
                      <div className={viewMode === 'grid' ? 'text-center' : 'flex items-center gap-4'}>
                        <div className={viewMode === 'grid' ? 'mb-3' : ''}>
                          <FileIcon className={`${viewMode === 'grid' ? 'w-12 h-12 mx-auto' : 'w-10 h-10'} ${getFileColor(file.type)}`} />
                        </div>
                        <div className={viewMode === 'grid' ? '' : 'flex-1 min-w-0'}>
                          <div className="flex items-center gap-2 justify-center">
                            <h3 className={`font-medium text-gray-900 dark:text-white ${viewMode === 'grid' ? 'truncate' : ''}`}>
                              {file.name}
                            </h3>
                            {file.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 justify-center text-xs text-gray-500 mt-1">
                            <span>{formatSize(file.size)}</span>
                            <span>•</span>
                            <span>{formatDate(file.modifiedAt)}</span>
                          </div>
                          {viewMode === 'grid' && (
                            <div className="flex items-center gap-2 justify-center mt-2">
                              <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                              {file.isShared && <Badge className="bg-green-100 text-green-700">Shared</Badge>}
                            </div>
                          )}
                        </div>
                        {viewMode === 'list' && (
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="space-y-4">
            <div className="space-y-2">
              {mockFiles
                .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
                .slice(0, 10)
                .map((file) => {
                  const FileIcon = getFileIcon(file.type)
                  return (
                    <Card key={file.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardContent className="p-4 flex items-center gap-4">
                        <FileIcon className={`w-10 h-10 ${getFileColor(file.type)}`} />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                          <p className="text-sm text-gray-500">Modified {formatDate(file.modifiedAt)} at {formatTime(file.modifiedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>

          {/* Starred Tab */}
          <TabsContent value="starred" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockFiles.filter(f => f.isStarred).map((file) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <Card key={file.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <FileIcon className={`w-12 h-12 mx-auto mb-2 ${getFileColor(file.type)}`} />
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{file.name}</h3>
                      <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-500" />
                  Shared Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSharedLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{link.fileName}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{link.viewCount} views</span>
                            <span>{link.downloadCount} downloads</span>
                            {link.expiresAt && <span>Expires {formatDate(link.expiresAt)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.isPasswordProtected && <Lock className="w-4 h-4 text-gray-400" />}
                        <Badge className={link.access === 'edit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {link.access}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                        {activity.action === 'modified' && <Edit className="w-4 h-4 text-cyan-600" />}
                        {activity.action === 'shared' && <Share2 className="w-4 h-4 text-green-600" />}
                        {activity.action === 'downloaded' && <Download className="w-4 h-4 text-blue-600" />}
                        {activity.action === 'created' && <Plus className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.fileName}</span>
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}</p>
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
                    <Cloud className="w-5 h-5 text-cyan-500" />
                    Sync Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Auto-sync</div>
                      <div className="text-sm text-gray-500">Sync files automatically</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Sync on Wi-Fi only</div>
                      <div className="text-sm text-gray-500">Save mobile data</div>
                    </div>
                    <input type="checkbox" className="toggle" />
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
                      <div className="font-medium text-gray-900 dark:text-white">File changes</div>
                      <div className="text-sm text-gray-500">Notify when files change</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Share notifications</div>
                      <div className="text-sm text-gray-500">When files are shared</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* File Detail Dialog */}
        <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>File Details</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {(() => {
                    const FileIcon = getFileIcon(selectedFile.type)
                    return <FileIcon className={`w-16 h-16 ${getFileColor(selectedFile.type)}`} />
                  })()}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedFile.name}</h2>
                    <p className="text-gray-500">{selectedFile.path}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedFile.status)}>{selectedFile.status}</Badge>
                      {selectedFile.isShared && <Badge className="bg-green-100 text-green-700">Shared</Badge>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-500">Size</span>
                    <p className="font-medium">{formatSize(selectedFile.size)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-500">Modified</span>
                    <p className="font-medium">{formatDate(selectedFile.modifiedAt)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-500">Owner</span>
                    <p className="font-medium">{selectedFile.owner}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-500">Version</span>
                    <p className="font-medium">v{selectedFile.version}</p>
                  </div>
                </div>
                {selectedFile.tags && selectedFile.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Tags</span>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedFile.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Star className={`w-4 h-4 ${selectedFile.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
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
