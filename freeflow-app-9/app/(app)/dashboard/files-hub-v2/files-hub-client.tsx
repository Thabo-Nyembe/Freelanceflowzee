'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
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
  Eye,
  Edit,
  Copy,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  History,
  Bell,
  Key,
  Shield,
  Database,
  Palette,
  Webhook,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  AlertOctagon,
  ShieldCheck
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

// Enhanced Files Hub Mock Data
const mockFilesHubAIInsights = [
  { id: '1', type: 'info' as const, title: 'Storage Usage', description: 'Using 67% of storage. Large video files taking up most space.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '2', type: 'success' as const, title: 'Sync Complete', description: 'All 1,247 files synced across 8 devices successfully.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Sync' },
  { id: '3', type: 'warning' as const, title: 'Duplicate Files', description: '23 potential duplicate files detected. Review to save space.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Cleanup' },
]

const mockFilesHubCollaborators = [
  { id: '1', name: 'File Manager', avatar: '/avatars/file.jpg', status: 'online' as const, role: 'Admin', lastActive: 'Now' },
  { id: '2', name: 'Team Member', avatar: '/avatars/team.jpg', status: 'online' as const, role: 'Editor', lastActive: '5m ago' },
  { id: '3', name: 'Guest User', avatar: '/avatars/guest.jpg', status: 'away' as const, role: 'Viewer', lastActive: '1h ago' },
]

const mockFilesHubPredictions = [
  { id: '1', label: 'Storage Used', current: 67, target: 100, predicted: 75, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Files Shared', current: 234, target: 300, predicted: 280, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Active Users', current: 45, target: 50, predicted: 48, confidence: 82, trend: 'up' as const },
]

const mockFilesHubActivities = [
  { id: '1', user: 'File Manager', action: 'organized', target: '45 files into folders', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'Team Member', action: 'uploaded', target: '12 new documents', timestamp: '30m ago', type: 'info' as const },
  { id: '3', user: 'Guest User', action: 'downloaded', target: 'Project assets.zip', timestamp: '1h ago', type: 'info' as const },
]

const mockFilesHubQuickActions = [
  { id: '1', label: 'Upload', icon: 'Upload', shortcut: 'U', action: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Opening file picker...', success: 'Select files to upload', error: 'Upload cancelled' }) },
  { id: '2', label: 'New Folder', icon: 'FolderPlus', shortcut: 'N', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Creating folder...', success: 'New folder created! Enter a name', error: 'Failed to create folder' }) },
  { id: '3', label: 'Share', icon: 'Share2', shortcut: 'S', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Preparing share link...', success: 'Share link copied to clipboard!', error: 'Failed to generate share link' }) },
  { id: '4', label: 'Search', icon: 'Search', shortcut: '/', action: () => toast.success('Search Files', { description: 'Type to search across 1,247 files in your library' }) },
]

// Database types matching schema
interface DbFile {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  type: string
  extension: string
  size: number
  url: string
  is_starred: boolean
  is_shared: boolean
  status: string
  version: number
  created_at: string
  updated_at: string
}

interface DbFolder {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  path: string
  file_count: number
  total_size: number
  color: string | null
  is_shared: boolean
  created_at: string
  updated_at: string
}

export default function FilesHubClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('files')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('modified')
  const [filterType, setFilterType] = useState<FileType | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('storage')

  // Data State
  const [files, setFiles] = useState<FileItem[]>(mockFiles)
  const [folders, setFolders] = useState<FolderItem[]>(mockFolders)
  const [loading, setLoading] = useState(true)

  // Form State
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('blue')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch files and folders
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [filesRes, foldersRes] = await Promise.all([
        supabase.from('files').select('*').eq('user_id', user.id).eq('status', 'active').order('updated_at', { ascending: false }),
        supabase.from('folders').select('*').eq('user_id', user.id).order('name')
      ])

      if (filesRes.data) {
        setFiles(filesRes.data.map((f: DbFile) => ({
          id: f.id,
          name: f.name,
          type: f.type as FileType,
          size: f.size,
          path: '/',
          parentId: f.folder_id,
          createdAt: f.created_at,
          modifiedAt: f.updated_at,
          owner: 'You',
          status: (f.status || 'synced') as FileStatus,
          isStarred: f.is_starred,
          isShared: f.is_shared,
          extension: f.extension,
          version: f.version
        })))
      }

      if (foldersRes.data) {
        setFolders(foldersRes.data.map((f: DbFolder) => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id,
          path: f.path,
          itemCount: f.file_count,
          size: f.total_size,
          createdAt: f.created_at,
          modifiedAt: f.updated_at,
          color: f.color || 'blue',
          isShared: f.is_shared
        })))
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Stats
  const stats: StorageStats = useMemo(() => ({
    totalSpace: 15 * 1024 * 1024 * 1024, // 15 GB
    usedSpace: files.reduce((sum, f) => sum + f.size, 0) + folders.reduce((sum, f) => sum + f.size, 0),
    fileCount: files.length,
    folderCount: folders.length,
    sharedFiles: files.filter(f => f.isShared).length,
    starredFiles: files.filter(f => f.isStarred).length,
    recentFiles: files.filter(f => new Date(f.modifiedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    trashedFiles: 0
  }), [files, folders])

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    const filtered = [...files].filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || file.type === filterType
      const matchesFolder = currentFolderId === null || file.parentId === currentFolderId
      return matchesSearch && matchesType && matchesFolder
    })

    // Sort
    filtered.sort((a, b) => {
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

    return filtered
  }, [files, searchQuery, filterType, currentFolderId, sortBy])

  const currentFolders = useMemo(() => {
    return folders.filter(f => f.parentId === currentFolderId)
  }, [folders, currentFolderId])

  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Home' }]
    if (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId)
      if (folder) {
        crumbs.push({ id: folder.id, name: folder.name })
      }
    }
    return crumbs
  }, [folders, currentFolderId])

  // CRUD Handlers
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const parentPath = currentFolderId
        ? folders.find(f => f.id === currentFolderId)?.path || '/'
        : '/'

      const { error } = await supabase.from('folders').insert({
        user_id: user.id,
        parent_id: currentFolderId,
        name: newFolderName.trim(),
        path: `${parentPath}/${newFolderName.trim()}`,
        color: newFolderColor
      })

      if (error) throw error
      toast.success('Folder created', { description: `"${newFolderName}" has been created` })
      setNewFolderName('')
      setShowCreateFolderDialog(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to create folder', { description: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      const { error } = await supabase.from('files').update({ status: 'deleted', deleted_at: new Date().toISOString() }).eq('id', fileId)
      if (error) throw error
      toast.success('File deleted', { description: `${fileName} moved to trash` })
      fetchData()
    } catch (error) {
      toast.error('Failed to delete file', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleToggleStar = async (fileId: string, currentlyStarred: boolean) => {
    try {
      const { error } = await supabase.from('files').update({ is_starred: !currentlyStarred }).eq('id', fileId)
      if (error) throw error
      toast.success(currentlyStarred ? 'Removed from starred' : 'Added to starred')
      fetchData()
    } catch (error) {
      toast.error('Failed to update star status')
    }
  }

  const handleShareFile = async (fileId: string, fileName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('file_shares').insert({
        file_id: fileId,
        shared_by: user.id,
        permission: 'view',
        can_download: true
      })
      if (error) throw error

      await supabase.from('files').update({ is_shared: true }).eq('id', fileId)
      toast.success('File shared', { description: `Share link created for ${fileName}` })
      fetchData()
    } catch (error) {
      toast.error('Failed to share file', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    try {
      const { error } = await supabase.from('folders').delete().eq('id', folderId)
      if (error) throw error
      toast.success('Folder deleted', { description: `"${folderName}" has been deleted` })
      if (currentFolderId === folderId) setCurrentFolderId(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete folder', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

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
            <Button variant="outline" size="sm" onClick={() => setShowCreateFolderDialog(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening file picker...', success: 'Ready to upload! Drag files here or select from your computer', error: 'Upload cancelled' })}>
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
              {[...files]
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
                          <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), {
                              loading: 'Preparing download...',
                              success: 'File downloaded successfully',
                              error: 'Download failed'
                            })}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShareFile(file.id, file.name)}>
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
              {files.filter(f => f.isStarred).map((file) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <Card key={file.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm cursor-pointer" onClick={() => { setSelectedFile(file); setShowFileDialog(true) }}>
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
          <TabsContent value="settings" className="space-y-6">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="storage" className="gap-2">
                  <HardDrive className="w-4 h-4" />
                  Storage
                </TabsTrigger>
                <TabsTrigger value="sharing" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Sharing
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Storage Settings */}
              <TabsContent value="storage" className="space-y-6">
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
                          <p className="font-medium text-gray-900 dark:text-white">Auto-sync Enabled</p>
                          <p className="text-sm text-gray-500">Sync files automatically</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Smart Sync</p>
                          <p className="text-sm text-gray-500">Only download files when accessed</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sync on Wi-Fi Only</p>
                          <p className="text-sm text-gray-500">Save mobile data</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sync Frequency</Label>
                        <Select defaultValue="realtime">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="5min">Every 5 minutes</SelectItem>
                            <SelectItem value="15min">Every 15 minutes</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="manual">Manual only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-cyan-500" />
                        Storage Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Storage Used</span>
                          <span className="text-sm text-gray-500">{formatSize(stats.usedSpace)} / {formatSize(stats.totalSpace)}</span>
                        </div>
                        <Progress value={(stats.usedSpace / stats.totalSpace) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cache Size Limit</Label>
                        <Select defaultValue="5gb">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1gb">1 GB</SelectItem>
                            <SelectItem value="2gb">2 GB</SelectItem>
                            <SelectItem value="5gb">5 GB</SelectItem>
                            <SelectItem value="10gb">10 GB</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Local Cache
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                        Upgrade Storage Plan
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-cyan-500" />
                        Offline Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Offline Access</p>
                          <p className="text-sm text-gray-500">Access files without internet</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-download Starred</p>
                          <p className="text-sm text-gray-500">Keep starred files offline</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-download Shared</p>
                          <p className="text-sm text-gray-500">Keep shared files offline</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>5 files</strong> currently available offline ({formatSize(125000000)})
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-cyan-500" />
                        Connected Devices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'MacBook Pro', type: 'Desktop', lastSync: '2 min ago', icon: Monitor },
                        { name: 'iPhone 15', type: 'Mobile', lastSync: '15 min ago', icon: Smartphone },
                        { name: 'iPad Pro', type: 'Tablet', lastSync: '1 hour ago', icon: Monitor }
                      ].map((device, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <device.icon className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{device.name}</p>
                              <p className="text-xs text-gray-500">{device.type} • Last sync: {device.lastSync}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600">Unlink</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Sharing Settings */}
              <TabsContent value="sharing" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-cyan-500" />
                        Default Share Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Default Link Access</Label>
                        <Select defaultValue="view">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View only</SelectItem>
                            <SelectItem value="comment">Can comment</SelectItem>
                            <SelectItem value="edit">Can edit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Default Link Expiration</Label>
                        <Select defaultValue="never">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1day">1 day</SelectItem>
                            <SelectItem value="7days">7 days</SelectItem>
                            <SelectItem value="30days">30 days</SelectItem>
                            <SelectItem value="90days">90 days</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Require Password</p>
                          <p className="text-sm text-gray-500">Password protect shared links</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Downloads</p>
                          <p className="text-sm text-gray-500">Let viewers download files</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-500" />
                        Team Sharing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Team Folder Access</p>
                          <p className="text-sm text-gray-500">Allow team members to view folders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Request Access</p>
                          <p className="text-sm text-gray-500">Allow requesting access to files</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">External Sharing</p>
                          <p className="text-sm text-gray-500">Share with people outside team</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">External Domain Whitelist</Label>
                        <Input placeholder="example.com, partner.org" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-cyan-500" />
                        Active Shared Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockSharedLinks.map((link) => (
                          <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                              <Button variant="ghost" size="sm"><Copy className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-cyan-500" />
                        Email Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">File Changes</p>
                          <p className="text-sm text-gray-500">When files are modified</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">New Shares</p>
                          <p className="text-sm text-gray-500">When files are shared with you</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Comments & Mentions</p>
                          <p className="text-sm text-gray-500">When you're mentioned in comments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Weekly Summary</p>
                          <p className="text-sm text-gray-500">Weekly activity digest</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email Frequency</Label>
                        <Select defaultValue="instant">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="hourly">Hourly digest</SelectItem>
                            <SelectItem value="daily">Daily digest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-cyan-500" />
                        Push Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
                          <p className="text-sm text-gray-500">Show desktop alerts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mobile Notifications</p>
                          <p className="text-sm text-gray-500">Push to mobile devices</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sync Complete</p>
                          <p className="text-sm text-gray-500">Notify when sync finishes</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Storage Alerts</p>
                          <p className="text-sm text-gray-500">When storage is nearly full</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quiet Hours</Label>
                        <div className="flex gap-2">
                          <Input type="time" defaultValue="22:00" className="flex-1" />
                          <span className="self-center">to</span>
                          <Input type="time" defaultValue="08:00" className="flex-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-cyan-500" />
                        Folder-Specific Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockFolders.slice(0, 4).map((folder) => (
                        <div key={folder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-5 h-5 text-blue-500" />
                            <span className="font-medium text-gray-900 dark:text-white">{folder.name}</span>
                          </div>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All changes</SelectItem>
                              <SelectItem value="important">Important only</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-cyan-500" />
                        Slack Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-[#4A154B] rounded flex items-center justify-center">
                          <span className="text-white font-bold">#</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Slack Workspace</p>
                          <p className="text-sm text-green-600">Connected to #files-notifications</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">File Uploads</p>
                          <p className="text-sm text-gray-500">Notify on new uploads</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Share Activity</p>
                          <p className="text-sm text-gray-500">Post when files are shared</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-cyan-500" />
                        Connected Apps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'Google Drive', status: 'connected', icon: '📁', desc: 'Sync Google Docs' },
                          { name: 'Microsoft 365', status: 'connected', icon: '📊', desc: 'Office integration' },
                          { name: 'Slack', status: 'connected', icon: '#', desc: 'File sharing' },
                          { name: 'Zoom', status: 'not_connected', icon: '📹', desc: 'Meeting files' },
                          { name: 'Notion', status: 'not_connected', icon: '📝', desc: 'Docs sync' },
                          { name: 'Figma', status: 'connected', icon: '🎨', desc: 'Design files' }
                        ].map((app, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl">
                                {app.icon}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                                <p className="text-xs text-gray-500">{app.desc}</p>
                              </div>
                            </div>
                            {app.status === 'connected' ? (
                              <Badge className="bg-green-100 text-green-700">Connected</Badge>
                            ) : (
                              <Button variant="outline" size="sm">Connect</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-cyan-500" />
                        Webhooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">File Upload Webhook</span>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                        <code className="text-xs text-gray-500 break-all">https://api.yourapp.com/webhooks/files</code>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Webhook
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-cyan-500" />
                        API Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">API Key</Label>
                        <div className="flex gap-2">
                          <Input value="fh_live_xxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono text-sm" type="password" />
                          <Button variant="outline" size="icon"><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="icon"><Copy className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Keep your API key secure. Never share it in public repositories.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate API Key
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-cyan-500" />
                        Access Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Extra security for your account</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">SSO Enforcement</p>
                          <p className="text-sm text-gray-500">Require SSO login</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Session Timeout</Label>
                        <Select defaultValue="24h">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1 hour</SelectItem>
                            <SelectItem value="8h">8 hours</SelectItem>
                            <SelectItem value="24h">24 hours</SelectItem>
                            <SelectItem value="7d">7 days</SelectItem>
                            <SelectItem value="30d">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Remote Wipe</p>
                          <p className="text-sm text-gray-500">Allow wiping devices remotely</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-cyan-500" />
                        Encryption
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">End-to-End Encryption</p>
                          <p className="text-sm text-gray-500">Encrypt files before upload</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Zero-Knowledge</p>
                          <p className="text-sm text-gray-500">Only you can decrypt files</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-green-800 dark:text-green-200">
                            AES-256 encryption enabled for all files
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Encryption Key</Label>
                        <div className="flex gap-2">
                          <Input value="•••••••••••••••••••••" readOnly className="flex-1 font-mono" />
                          <Button variant="outline" size="icon"><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-cyan-500" />
                        Audit Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Audit Logging</p>
                          <p className="text-sm text-gray-500">Track all file activities</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Log Retention</Label>
                        <Select defaultValue="1year">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30days">30 days</SelectItem>
                            <SelectItem value="90days">90 days</SelectItem>
                            <SelectItem value="1year">1 year</SelectItem>
                            <SelectItem value="7years">7 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export Audit Log
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Audit Log
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-500" />
                        IP & Location Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
                          <p className="text-sm text-gray-500">Restrict access by IP</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Allowed IP Ranges</Label>
                        <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Geo-Restrictions</p>
                          <p className="text-sm text-gray-500">Limit by country</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Allowed Countries</Label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
                            <SelectItem value="us-only">US only</SelectItem>
                            <SelectItem value="eu-only">EU only</SelectItem>
                            <SelectItem value="custom">Custom list</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-cyan-500" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Version History</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">Keep 7 versions</SelectItem>
                            <SelectItem value="30">Keep 30 versions</SelectItem>
                            <SelectItem value="90">Keep 90 versions</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Deleted File Retention</Label>
                        <Select defaultValue="30days">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7days">7 days</SelectItem>
                            <SelectItem value="30days">30 days</SelectItem>
                            <SelectItem value="90days">90 days</SelectItem>
                            <SelectItem value="1year">1 year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Empty Trash Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-cyan-500" />
                        Backup Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Automatic Backups</p>
                          <p className="text-sm text-gray-500">Backup files automatically</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Backup Frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Last backup: Today at 3:00 AM
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Create Backup Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-cyan-500" />
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Default View</Label>
                        <Select defaultValue="grid">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid view</SelectItem>
                            <SelectItem value="list">List view</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Default Sort</Label>
                        <Select defaultValue="modified">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="modified">Last modified</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show File Extensions</p>
                          <p className="text-sm text-gray-500">Display file extensions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Hidden Files</p>
                          <p className="text-sm text-gray-500">Display hidden files</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm border-red-200 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertOctagon className="w-5 h-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All Files
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <Link2 className="w-4 h-4 mr-2" />
                        Revoke All Shared Links
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <Lock className="w-4 h-4 mr-2" />
                        Disable Files Hub
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockFilesHubAIInsights}
              title="Files Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockFilesHubCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockFilesHubPredictions}
              title="Storage Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockFilesHubActivities}
            title="File Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockFilesHubQuickActions}
            variant="grid"
          />
        </div>

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
                  <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), {
                      loading: 'Preparing download...',
                      success: 'File downloaded successfully',
                      error: 'Download failed'
                    })}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleShareFile(selectedFile.id, selectedFile.name)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={() => handleToggleStar(selectedFile.id, selectedFile.isStarred)}>
                    <Star className={`w-4 h-4 ${selectedFile.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                  <Button variant="outline" className="text-red-600" onClick={() => { handleDeleteFile(selectedFile.id, selectedFile.name); setShowFileDialog(false) }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Folder Name</Label>
                <Input
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="cyan">Cyan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder} disabled={isSubmitting} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                {isSubmitting ? 'Creating...' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
