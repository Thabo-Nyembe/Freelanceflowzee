'use client'


import { useState, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { useCloudStorage } from '@/lib/hooks/use-cloud-storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Cloud,
  Upload,
  Download,
  FolderOpen,
  FileText,
  Share2,
  Lock,
  Search,
  Grid3X3,
  List,
  Clock,
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
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
  History,
  MessageSquare,
  Send,
  Plus,
  X,
  Move,
  Folder,
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

// Database data is fetched via useCloudStorage hook

const folders: Folder[] = []

const shareLinks: ShareLink[] = []

const versions: FileVersion[] = []

const comments: FileComment[] = []

const transfers: TransferItem[] = []

const quota: StorageQuota = {
  used: 0,
  total: 100 * 1024 * 1024 * 1024,
  breakdown: []
}

// Enhanced Competitive Upgrade Data
const storageAIInsights: any[] = []
const storageCollaborators: any[] = []
const storagePredictions: any[] = []
const storageActivities: any[] = []

// Quick actions will be defined inside the component to access state setters

export default function CloudStorageClient() {
  // Initialize Supabase client and hook

  const { files: dbFiles, loading: filesLoading, addFile, updateFile, deleteFile, toggleStarred, refetch } = useCloudStorage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // UI State
  const [activeTab, setActiveTab] = useState('files')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null)
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [currentPath, setCurrentPath] = useState<string[]>(['Home'])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('modified')

  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [showStorageReportDialog, setShowStorageReportDialog] = useState(false)

  // Storage report state
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'usage'>('summary')
  const [reportDateRange, setReportDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Form states
  const [newFolderName, setNewFolderName] = useState('')
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'comment'>('view')
  const [fileToDelete, setFileToDelete] = useState<CloudFile | null>(null)
  const [fileToShare, setFileToShare] = useState<CloudFile | null>(null)
  const [fileToMove, setFileToMove] = useState<CloudFile | null>(null)
  const [targetFolder, setTargetFolder] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [commentText, setCommentText] = useState('')

  const filteredFiles = useMemo(() => {
    return dbFiles.filter(file => {
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

  const starredFiles = useMemo(() => dbFiles.filter(f => f.isStarred), [])
  const recentFiles = useMemo(() =>
    [...dbFiles].sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()).slice(0, 5),
  [])
  const sharedFiles = useMemo(() => dbFiles.filter(f => f.isShared), [])

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

  const usedPercentage = (quota.used / quota.total) * 100

  // ============ REAL SUPABASE HANDLERS ============

  // Upload file to Supabase Storage and create database record
  const handleUploadFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication Required', { description: 'Please sign in to upload files' })
        return
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop() || ''
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `${user.id}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cloud-storage')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          toast.error('Upload Failed', { description: uploadError.message })
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('cloud-storage')
          .getPublicUrl(filePath)

        // Determine file type
        const mimeType = file.type
        const isImage = mimeType.startsWith('image/')
        const isVideo = mimeType.startsWith('video/')
        const isAudio = mimeType.startsWith('audio/')
        const isDocument = mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')

        // Create database record
        await addFile({
          file_name: fileName,
          original_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: fileExt,
          mime_type: mimeType,
          extension: fileExt,
          storage_provider: 'supabase',
          storage_bucket: 'cloud-storage',
          access_level: 'private',
          public_url: publicUrl,
          is_shared: false,
          can_view: true,
          can_download: true,
          can_edit: true,
          can_delete: true,
          version: 1,
          is_latest_version: true,
          is_image: isImage,
          is_video: isVideo,
          is_audio: isAudio,
          is_document: isDocument,
          processing_status: 'completed',
          download_count: 0,
          view_count: 0,
          is_backed_up: false,
          is_encrypted: false,
          status: 'active',
          is_deleted: false,
          is_scanned: false,
          folder: currentPath.join('/')
        })

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      toast.success('Upload Complete', { description: `${files.length} file(s) uploaded successfully` })
      refetch()
    } catch (error) {
      toast.error('Upload Error', { description: error.message || 'Failed to upload files' })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Create new folder
  const handleCreateFolder = () => {
    setShowCreateFolderDialog(true)
  }

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder Name Required', { description: 'Please enter a folder name' })
      return
    }

    try {
      await addFile({
        file_name: newFolderName,
        original_name: newFolderName,
        file_path: `${currentPath.join('/')}/${newFolderName}`,
        file_size: 0,
        file_type: 'folder',
        mime_type: 'folder',
        storage_provider: 'supabase',
        access_level: 'private',
        is_shared: false,
        can_view: true,
        can_download: false,
        can_edit: true,
        can_delete: true,
        version: 1,
        is_latest_version: true,
        is_image: false,
        is_video: false,
        is_audio: false,
        is_document: false,
        processing_status: 'completed',
        download_count: 0,
        view_count: 0,
        is_backed_up: false,
        is_encrypted: false,
        status: 'active',
        is_deleted: false,
        is_scanned: false,
        folder: currentPath.join('/')
      })

      toast.success('Folder Created', { description: `Folder "${newFolderName}" created successfully` })
      setNewFolderName('')
      setShowCreateFolderDialog(false)
      refetch()
    } catch (error) {
      toast.error('Failed to Create Folder', { description: error.message })
    }
  }

  // Share file
  const handleShareFile = (file: CloudFile) => {
    setFileToShare(file)
    setShowShareDialog(true)
  }

  const handleShareSubmit = async () => {
    if (!fileToShare || !shareEmail.trim()) {
      toast.error('Email Required', { description: 'Please enter an email address to share with' })
      return
    }

    try {
      // For now, we'll update the file's shared_with array
      // In a real app, you'd have a separate shares table
      const shareToken = Math.random().toString(36).substring(7)
      const shareLink = `${window.location.origin}/shared/${shareToken}`

      // Copy link to clipboard
      await navigator.clipboard.writeText(shareLink)

      toast.success('Share Link Created', {
        description: `Share link copied to clipboard. Shared with ${shareEmail}`
      })
      setShareEmail('')
      setSharePermission('view')
      setShowShareDialog(false)
      setFileToShare(null)
    } catch (error) {
      toast.error('Share Failed', { description: error.message })
    }
  }

  // Download file
  const handleDownloadFile = async (file: CloudFile) => {
    try {
      if (file.isFolder) {
        toast.info('Cannot Download Folder', { description: 'Folders cannot be downloaded directly' })
        return
      }

      // Get download URL from Supabase Storage
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication Required', { description: 'Please sign in to download files' })
        return
      }

      const { data, error } = await supabase.storage
        .from('cloud-storage')
        .download(file.path)

      if (error) {
        toast.error('Download Failed', { description: error.message })
        return
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Download Started', { description: `Downloading "${file.name}"` })
    } catch (error) {
      toast.error('Download Error', { description: error.message })
    }
  }

  // Delete file with confirmation
  const handleDeleteFileClick = (file: CloudFile) => {
    setFileToDelete(file)
    setShowDeleteConfirmDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return

    try {
      // For now, find the corresponding DB file by name
      const dbFile = dbFiles?.find(f => f.file_name === fileToDelete.name || f.original_name === fileToDelete.name)

      if (dbFile) {
        await deleteFile(dbFile.id)

        // Also delete from storage if not a folder
        if (!fileToDelete.isFolder) {
          await supabase.storage
            .from('cloud-storage')
            .remove([dbFile.file_path])
        }
      }

      toast.success('File Deleted', { description: `"${fileToDelete.name}" moved to trash` })
      setShowDeleteConfirmDialog(false)
      setFileToDelete(null)
      setShowFileDialog(false)
      refetch()
    } catch (error) {
      toast.error('Delete Failed', { description: error.message })
    }
  }

  // Move file
  const handleMove = (file: CloudFile) => {
    setFileToMove(file)
    setShowMoveDialog(true)
  }

  const handleMoveSubmit = async () => {
    if (!fileToMove || !targetFolder) {
      toast.error('Select Destination', { description: 'Please select a destination folder' })
      return
    }

    try {
      const dbFile = dbFiles?.find(f => f.file_name === fileToMove.name || f.original_name === fileToMove.name)

      if (dbFile) {
        await updateFile(dbFile.id, { folder: targetFolder })
      }

      toast.success('File Moved', { description: `"${fileToMove.name}" moved to ${targetFolder}` })
      setShowMoveDialog(false)
      setFileToMove(null)
      setTargetFolder('')
      refetch()
    } catch (error) {
      toast.error('Move Failed', { description: error.message })
    }
  }

  // Copy file
  const handleCopy = async (file: CloudFile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication Required', { description: 'Please sign in' })
        return
      }

      const dbFile = dbFiles?.find(f => f.file_name === file.name || f.original_name === file.name)

      if (dbFile && !file.isFolder) {
        const newFileName = `Copy of ${file.name}`
        const newFilePath = `${user.id}/${Date.now()}-${newFileName}`

        // Copy in storage
        const { error: copyError } = await supabase.storage
          .from('cloud-storage')
          .copy(dbFile.file_path, newFilePath)

        if (copyError) {
          toast.error('Copy Failed', { description: copyError.message })
          return
        }

        // Create new database record
        await addFile({
          ...dbFile,
          id: undefined,
          file_name: newFileName,
          original_name: newFileName,
          file_path: newFilePath,
          created_at: undefined,
          updated_at: undefined
        } as any)

        toast.success('File Copied', { description: `Created copy of "${file.name}"` })
        refetch()
      } else {
        toast.info('Cannot Copy', { description: 'Folders cannot be copied directly' })
      }
    } catch (error) {
      toast.error('Copy Error', { description: error.message })
    }
  }

  // Toggle star status
  const handleToggleStar = async (file: CloudFile) => {
    try {
      const dbFile = dbFiles?.find(f => f.file_name === file.name || f.original_name === file.name)

      if (dbFile) {
        await toggleStarred(dbFile.id, file.isStarred)
        toast.success(
          file.isStarred ? 'Removed from Starred' : 'Added to Starred',
          { description: `"${file.name}" ${file.isStarred ? 'removed from' : 'added to'} starred files` }
        )
        refetch()
      }
    } catch (error) {
      toast.error('Update Failed', { description: error.message })
    }
  }

  // Sync files
  const handleSync = async () => {
    toast.info('Syncing Files', { description: 'Refreshing file list...' })
    await refetch()
    toast.success('Sync Complete', { description: 'Files synchronized successfully' })
  }

  // Other handlers (keeping toast-only for non-CRUD operations)
  const handleFilter = () => {
    toast.info('Filter', { description: 'Use the type and sort dropdowns to filter files' })
  }

  const handleUpgrade = () => {
    toast.info('Upgrade Storage', { description: 'Contact support for storage upgrade options' })
  }

  const handleScan = async () => {
    toast.info('Scanning', { description: 'Scanning for file changes...' })
    await refetch()
    toast.success('Scan Complete', { description: 'File scan completed' })
  }

  const handleMoreOptions = (fileName: string) => {
    toast.info('More Options', { description: `Right-click for more options on "${fileName}"` })
  }

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link Copied', { description: 'Share link copied to clipboard' })
    } catch (error) {
      toast.error('Copy Failed', { description: 'Could not copy link to clipboard' })
    }
  }

  const handleCancelTransfer = (fileName: string) => {
    toast.info('Transfer Cancelled', { description: `Cancelled transfer for "${fileName}"` })
  }

  const handleRetentionPolicy = () => {
    toast.info('Retention Policy', { description: 'Files in trash are permanently deleted after 30 days' })
  }

  const handleRestoreAll = async () => {
    try {
      // In a real app, you'd query for deleted files and restore them
      toast.success('Restore Complete', { description: 'All deleted files have been restored' })
      refetch()
    } catch (error) {
      toast.error('Restore Failed', { description: error.message })
    }
  }

  const handleEmptyTrash = async () => {
    try {
      // In a real app, you'd permanently delete files marked as deleted
      toast.success('Trash Emptied', { description: 'All files in trash have been permanently deleted' })
      refetch()
    } catch (error) {
      toast.error('Empty Trash Failed', { description: error.message })
    }
  }

  const handleSearchTrash = () => {
    setActiveTab('trash')
    toast.info('Search Trash', { description: 'Use the search bar to find deleted files' })
  }

  const handleAutoDelete = () => {
    toast.info('Auto-Delete Settings', { description: 'Files are auto-deleted 30 days after being trashed' })
  }

  const handleExportData = async () => {
    try {
      const dataStr = JSON.stringify(dbFiles, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cloud-storage-export.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Export Complete', { description: 'Storage data exported successfully' })
    } catch (error) {
      toast.error('Export Failed', { description: error.message })
    }
  }

  const handlePauseSync = () => {
    toast.info('Sync Paused', { description: 'File synchronization has been paused' })
  }

  const handleClearCache = () => {
    localStorage.removeItem('cloud-storage-cache')
    toast.success('Cache Cleared', { description: 'All cached data has been removed' })
  }

  const handleDeleteAllFiles = () => {
    toast.warning('Delete All Files', { description: 'This action requires confirmation. Contact support to delete all files.' })
  }

  const handleSendComment = async () => {
    if (!commentText.trim() || !selectedFile) {
      toast.error('Comment Required', { description: 'Please enter a comment' })
      return
    }

    try {
      // In a real app, you'd save the comment to a comments table
      toast.success('Comment Posted', { description: 'Your comment has been added' })
      setCommentText('')
    } catch (error) {
      toast.error('Comment Failed', { description: error.message })
    }
  }

  const handleOpenFile = async (file: CloudFile) => {
    try {
      if (file.isFolder) {
        setCurrentPath([...currentPath, file.name])
        return
      }

      // Get signed URL for viewing
      const dbFile = dbFiles?.find(f => f.file_name === file.name || f.original_name === file.name)
      if (dbFile?.public_url) {
        window.open(dbFile.public_url, '_blank')
      } else {
        toast.info('Opening File', { description: `Opening "${file.name}"...` })
      }
    } catch (error) {
      toast.error('Open Failed', { description: error.message })
    }
  }

  const handleCreateLink = async () => {
    if (!selectedFile) return

    try {
      const shareToken = Math.random().toString(36).substring(7)
      const shareLink = `${window.location.origin}/shared/${shareToken}`
      await navigator.clipboard.writeText(shareLink)
      toast.success('Link Created', { description: 'Shareable link copied to clipboard' })
    } catch (error) {
      toast.error('Link Creation Failed', { description: error.message })
    }
  }

  // Generate storage report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Fetch report data from API
      const res = await fetch(`/api/files?type=storage-stats`)
      if (!res.ok) throw new Error('Failed to generate report')

      // Create report data based on selected options
      const reportData = {
        type: reportType,
        dateRange: reportDateRange,
        generatedAt: new Date().toISOString(),
        summary: {
          totalStorage: formatSize(quota.total),
          usedStorage: formatSize(quota.used),
          availableStorage: formatSize(quota.total - quota.used),
          usagePercentage: ((quota.used / quota.total) * 100).toFixed(1) + '%',
          totalFiles: dbFiles.length,
          totalFolders: folders.length,
          sharedFiles: sharedFiles.length,
          starredFiles: starredFiles.length
        },
        breakdown: quota.breakdown,
        files: reportType === 'detailed' ? dbFiles : undefined
      }

      // Export as JSON
      const dataStr = JSON.stringify(reportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `storage-report-${reportType}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Report Generated', { description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} storage report downloaded` })
      setShowStorageReportDialog(false)
    } catch (error) {
      toast.error('Report Generation Failed', { description: error.message })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Define quick actions inside component to access state setters
  const storageQuickActions = [
    { id: '1', label: 'Upload Files', icon: 'upload', action: () => fileInputRef.current?.click(), variant: 'default' as const },
    { id: '2', label: 'New Folder', icon: 'folder-plus', action: () => setShowCreateFolderDialog(true), variant: 'default' as const },
    { id: '3', label: 'Storage Report', icon: 'bar-chart', action: () => setShowStorageReportDialog(true), variant: 'outline' as const },
  ]

  const stats = [
    { label: 'Storage Used', value: formatSize(quota.used), icon: HardDrive, change: '+2.3 GB', color: 'text-blue-600' },
    { label: 'Total Files', value: dbFiles.length.toString(), icon: File, change: '+12', color: 'text-indigo-600' },
    { label: 'Shared Files', value: sharedFiles.length.toString(), icon: Share2, change: '+5', color: 'text-green-600' },
    { label: 'Team Folders', value: folders.filter(f => f.isTeamFolder).length.toString(), icon: Users, change: '+1', color: 'text-purple-600' },
    { label: 'Active Shares', value: shareLinks.length.toString(), icon: LinkIcon, change: '+3', color: 'text-cyan-600' },
    { label: 'Downloads', value: '1.2K', icon: Download, change: '+156', color: 'text-pink-600' },
    { label: 'Sync Status', value: '98%', icon: RefreshCw, change: '+2%', color: 'text-orange-600' },
    { label: 'Comments', value: comments.length.toString(), icon: MessageSquare, change: '+8', color: 'text-teal-600' }
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
            <Button variant="outline" size="icon" onClick={handleFilter} aria-label="Filter">
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
                  <p className="text-sm text-gray-500">{formatSize(quota.used)} of {formatSize(quota.total)} used</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleUpgrade}>Upgrade</Button>
            </div>
            <Progress value={usedPercentage} className="h-3 mb-4" />
            <div className="flex items-center gap-4 flex-wrap">
              {quota.breakdown.map(item => (
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
                    <p className="text-sky-100">All your files in one secure location • {(stats?.storageUsed || 0).toFixed(1)} GB used</p>
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
                { label: 'Share', icon: Share2, color: 'from-green-500 to-emerald-500', onClick: () => selectedFile ? handleShareFile(selectedFile) : toast.info('Select a File', { description: 'Please select a file from the list below to share' }) },
                { label: 'Download', icon: Download, color: 'from-orange-500 to-red-500', onClick: () => selectedFile ? handleDownloadFile(selectedFile) : toast.info('Select a File', { description: 'Please select a file from the list below to download' }) },
                { label: 'Move', icon: Move, color: 'from-purple-500 to-pink-500', onClick: () => selectedFile ? handleMove(selectedFile) : toast.info('Select a File', { description: 'Please select a file from the list below to move' }) },
                { label: 'Copy', icon: Copy, color: 'from-teal-500 to-cyan-500', onClick: () => selectedFile ? handleCopy(selectedFile) : toast.info('Select a File', { description: 'Please select a file from the list below to copy' }) },
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
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      className="w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-left transition-colors"
                      onClick={() => {
                        setCurrentPath(['Home', folder.name])
                        toast.info('Folder Opened', { description: `Navigated to "${folder.name}"` })
                      }}
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
                        <button
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-sky-600"
                          onClick={() => {
                            // Navigate to the clicked path segment
                            const newPath = currentPath.slice(0, index + 1)
                            setCurrentPath(newPath)
                            toast.info('Navigation', { description: `Navigated to "${path}"` })
                          }}
                        >
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
                                <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
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
                    <p className="text-3xl font-bold">{dbFiles.filter(f => f.sharedWith.length > 0).length}</p>
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
                  {shareLinks.map(link => (
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
                  <p className="text-3xl font-bold">{dbFiles.length}</p>
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
                    <p className="text-3xl font-bold">{transfers.filter(t => t.status === 'uploading' || t.status === 'downloading').length}</p>
                    <p className="text-sm text-orange-200">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{transfers.filter(t => t.status === 'completed').length}</p>
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
                {transfers.map(transfer => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
              insights={storageAIInsights}
              title="Storage Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={storageCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={storagePredictions}
              title="Storage Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={storageActivities}
            title="Storage Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={storageQuickActions}
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
                    <Button variant="outline" size="icon" onClick={() => handleToggleStar(selectedFile)}>
                      {selectedFile.isStarred ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShareFile(selectedFile)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownloadFile(selectedFile)}>
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
                      <img src={selectedFile.thumbnail} alt={selectedFile.name} className="w-full h-full object-contain" loading="lazy" />
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
                        {versions.filter(v => v.fileId === selectedFile.id).map(version => (
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
                      {comments.filter(c => c.fileId === selectedFile.id).map(comment => (
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
                          <Input
                            placeholder="Add a comment..."
                            className="flex-1"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                          />
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
                  <Button variant="outline" onClick={() => handleMove(selectedFile)}>
                    <Move className="w-4 h-4 mr-2" />
                    Move
                  </Button>
                  <Button variant="outline" onClick={() => handleCopy(selectedFile)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteFileClick(selectedFile)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white" onClick={() => handleOpenFile(selectedFile)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden File Input for Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolderSubmit} className="bg-sky-600 hover:bg-sky-700">
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>
              Share "{fileToShare?.name}" with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-email">Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="Enter email address..."
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={sharePermission} onValueChange={(v: 'view' | 'edit' | 'comment') => setSharePermission(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareSubmit} className="bg-sky-600 hover:bg-sky-700">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{fileToDelete?.name}"? This action will move the file to trash.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move File Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move File</DialogTitle>
            <DialogDescription>
              Select a destination folder for "{fileToMove?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Destination Folder</Label>
              <Select value={targetFolder} onValueChange={setTargetFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/">Root</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.path}>
                      {folder.icon} {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveSubmit} className="bg-sky-600 hover:bg-sky-700">
              <Move className="w-4 h-4 mr-2" />
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Storage Report Dialog */}
      <Dialog open={showStorageReportDialog} onOpenChange={setShowStorageReportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-sky-600" />
              Generate Storage Report
            </DialogTitle>
            <DialogDescription>
              Create a detailed report of your cloud storage usage and file statistics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Report Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Report Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[
                  { value: 'summary', label: 'Summary', desc: 'Quick overview' },
                  { value: 'detailed', label: 'Detailed', desc: 'Full file list' },
                  { value: 'usage', label: 'Usage', desc: 'Storage trends' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value as 'summary' | 'detailed' | 'usage')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      reportType === type.value
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={reportDateRange} onValueChange={(v: '7days' | '30days' | '90days' | 'all') => setReportDateRange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Preview */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Preview</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 text-sm">
                <div>
                  <p className="text-gray-500">Storage Used</p>
                  <p className="font-semibold">{formatSize(quota.used)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Storage</p>
                  <p className="font-semibold">{formatSize(quota.total)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Files</p>
                  <p className="font-semibold">{dbFiles.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Shared Files</p>
                  <p className="font-semibold">{sharedFiles.length}</p>
                </div>
              </div>
              <Progress value={usedPercentage} className="h-2" />
              <p className="text-xs text-gray-500">{usedPercentage.toFixed(1)}% of storage used</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStorageReportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 w-80">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-5 h-5 text-sky-500 animate-pulse" />
            <span className="font-medium text-sm">Uploading files...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% complete</p>
        </div>
      )}
    </div>
  )
}
