'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/button-handlers'
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
  ShieldCheck,
  CloudUpload,
  // Additional icons for switch labels
  Zap,
  Wifi,
  CloudOff,
  LockKeyhole,
  UserCheck,
  Globe2,
  FileEdit,
  AtSign,
  CalendarDays,
  HardDriveDownload,
  MessageSquare,
  Fingerprint,
  KeyRound,
  Eraser,
  ShieldOff,
  ScrollText,
  MapPin,
  ToggleRight,
  FileQuestion
} from 'lucide-react'

// World-class file upload with drag & drop
import { AdvancedFileUpload, type UploadedFile } from '@/components/world-class/file-upload/advanced-file-upload'

// Production-ready API hooks for file management
import {
  useFiles,
  useUploadFile,
  useUploadFiles,
  useUpdateFile,
  useDeleteFile,
  usePermanentlyDeleteFile,
  useStarFile,
  useFolders,
  useCreateFolder,
  useStorageStats,
  useDownloadFile,
  useMoveFile,
  type FileItem as ApiFileItem,
  type Folder as ApiFolder
} from '@/lib/api-clients'





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

// Database types for shared links
interface DbFileShare {
  id: string
  file_id: string
  shared_by: string
  shared_with: string | null
  email: string | null
  permission: 'view' | 'comment' | 'edit' | 'admin'
  can_download: boolean
  expires_at: string | null
  is_active: boolean
  access_count: number
  created_at: string
  files?: {
    name: string
  }
}

// Database types for file activities
interface DbFileActivity {
  id: string
  file_id: string
  user_id: string
  activity: string
  description: string | null
  created_at: string
  files?: {
    name: string
  }
  profiles?: {
    full_name: string | null
  }
}

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

// Quick actions are defined inside the component to access state and handlers

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

interface FilesHubClientProps {
  initialFiles?: FileItem[]
}

export default function FilesHubClient({ initialFiles = [] }: FilesHubClientProps) {
  // Supabase client for direct queries (shared links, activities)
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

  // Local state for shared links and activities (still fetched directly)
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [activities, setActivities] = useState<FileActivity[]>([])

  // ==================== API HOOKS ====================
  // Files - using production-ready TanStack Query hooks
  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles
  } = useFiles(1, 100, { folder_id: currentFolderId || undefined, status: 'active' })

  // Folders - using production-ready TanStack Query hooks
  const {
    data: foldersData,
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders
  } = useFolders()

  // Storage Stats - using production-ready TanStack Query hooks
  const {
    data: storageStatsData,
    isLoading: storageStatsLoading,
    refetch: refetchStorageStats
  } = useStorageStats()

  // Mutations
  const uploadFileMutation = useUploadFile()
  const uploadFilesMutation = useUploadFiles()
  const deleteFileMutation = useDeleteFile()
  const permanentlyDeleteFileMutation = usePermanentlyDeleteFile()
  const starFileMutation = useStarFile()
  const moveFileMutation = useMoveFile()
  const updateFileMutation = useUpdateFile()
  const createFolderMutation = useCreateFolder()
  const downloadFileMutation = useDownloadFile()

  // Transform API data to local format
  const files: FileItem[] = useMemo(() => {
    if (!filesData?.data) return []
    return filesData.data.map((f: ApiFileItem) => ({
      id: f.id,
      name: f.original_name || f.filename,
      type: (f.file_type || 'other') as FileType,
      size: f.size || 0,
      path: f.url || '/',
      parentId: f.folder_id || null,
      createdAt: f.created_at,
      modifiedAt: f.updated_at,
      owner: 'You',
      status: 'synced' as FileStatus,
      isStarred: f.is_starred || false,
      isShared: f.is_shared || false,
      extension: f.extension,
      version: f.version || 1
    }))
  }, [filesData])

  const folders: FolderItem[] = useMemo(() => {
    if (!foldersData) return []
    return foldersData.map((f: ApiFolder) => ({
      id: f.id,
      name: f.name,
      parentId: f.parent_id || null,
      path: f.path || '/',
      itemCount: f.file_count || 0,
      size: f.total_size || 0,
      createdAt: f.created_at,
      modifiedAt: f.updated_at,
      color: f.color || 'blue',
      isShared: f.is_shared || false
    }))
  }, [foldersData])

  // Combine loading and error states
  const loading = filesLoading || foldersLoading
  const error = filesError?.message || foldersError?.message || null

  // Form State
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('blue')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs and visibility toggles
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showEncryptionKey, setShowEncryptionKey] = useState(false)

  // Dialog states for buttons
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showFileOptionsDialog, setShowFileOptionsDialog] = useState(false)
  const [selectedFileForOptions, setSelectedFileForOptions] = useState<FileItem | null>(null)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showUpgradeStorageDialog, setShowUpgradeStorageDialog] = useState(false)
  const [showUnlinkDeviceDialog, setShowUnlinkDeviceDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<{ name: string; type: string } | null>(null)
  const [showConnectAppDialog, setShowConnectAppDialog] = useState(false)
  const [selectedApp, setSelectedApp] = useState<{ name: string; desc: string } | null>(null)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEvent, setWebhookEvent] = useState('file_upload')
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showExportAuditLogDialog, setShowExportAuditLogDialog] = useState(false)
  const [showViewAuditLogDialog, setShowViewAuditLogDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false)
  const [showCreateBackupDialog, setShowCreateBackupDialog] = useState(false)
  const [showDeleteAllFilesDialog, setShowDeleteAllFilesDialog] = useState(false)
  const [showRevokeAllLinksDialog, setShowRevokeAllLinksDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDisableFilesHubDialog, setShowDisableFilesHubDialog] = useState(false)

  // Advanced upload dialog state (world-class drag & drop component)
  const [showAdvancedUpload, setShowAdvancedUpload] = useState(false)

  // Switch state variables for settings
  // Sync Settings
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [smartSyncEnabled, setSmartSyncEnabled] = useState(true)
  const [syncOnWifiOnly, setSyncOnWifiOnly] = useState(false)

  // Offline Access
  const [offlineAccessEnabled, setOfflineAccessEnabled] = useState(true)
  const [autoDownloadStarred, setAutoDownloadStarred] = useState(true)
  const [autoDownloadShared, setAutoDownloadShared] = useState(false)

  // Sharing Settings
  const [requirePassword, setRequirePassword] = useState(false)
  const [allowDownloads, setAllowDownloads] = useState(true)
  const [teamFolderAccess, setTeamFolderAccess] = useState(true)
  const [requestAccessEnabled, setRequestAccessEnabled] = useState(true)
  const [externalSharing, setExternalSharing] = useState(true)

  // Email Notifications
  const [notifyFileChanges, setNotifyFileChanges] = useState(true)
  const [notifyNewShares, setNotifyNewShares] = useState(true)
  const [notifyCommentsMentions, setNotifyCommentsMentions] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)

  // Push Notifications
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [mobileNotifications, setMobileNotifications] = useState(true)
  const [syncCompleteNotify, setSyncCompleteNotify] = useState(false)
  const [storageAlerts, setStorageAlerts] = useState(true)

  // Slack Integration
  const [slackFileUploads, setSlackFileUploads] = useState(true)
  const [slackShareActivity, setSlackShareActivity] = useState(true)

  // Security - Access Controls
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [ssoEnforcement, setSsoEnforcement] = useState(false)
  const [remoteWipe, setRemoteWipe] = useState(true)

  // Security - Encryption
  const [endToEndEncryption, setEndToEndEncryption] = useState(true)
  const [zeroKnowledge, setZeroKnowledge] = useState(false)

  // Security - Audit Log
  const [auditLogging, setAuditLogging] = useState(true)

  // Security - IP & Location
  const [ipWhitelist, setIpWhitelist] = useState(false)
  const [geoRestrictions, setGeoRestrictions] = useState(false)

  // Advanced - Backup
  const [automaticBackups, setAutomaticBackups] = useState(true)

  // Advanced - Appearance
  const [showFileExtensions, setShowFileExtensions] = useState(true)
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)

  // Map database activity types to UI activity types
  const mapActivityType = (activity: string): FileActivity['action'] => {
    const activityMap: Record<string, FileActivity['action']> = {
      'upload': 'created',
      'edit': 'modified',
      'rename': 'renamed',
      'move': 'moved',
      'delete': 'deleted',
      'share': 'shared',
      'download': 'downloaded'
    }
    return activityMap[activity] || 'modified'
  }

  // Fetch shared links and activities (files/folders now use API hooks)
  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch shares and activities (not covered by main API hooks)
      const [sharesRes, activitiesRes] = await Promise.all([
        supabase.from('file_shares').select(`
          id,
          file_id,
          shared_by,
          shared_with,
          email,
          permission,
          can_download,
          expires_at,
          is_active,
          access_count,
          created_at,
          files!inner(name)
        `).eq('shared_by', user.id).eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('file_activities').select(`
          id,
          file_id,
          user_id,
          activity,
          description,
          created_at,
          files!inner(name)
        `).eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      ])

      if (sharesRes.data) {
        setSharedLinks(sharesRes.data.map((s: DbFileShare) => ({
          id: s.id,
          fileId: s.file_id,
          fileName: s.files?.name || 'Unknown file',
          access: s.permission === 'edit' || s.permission === 'admin' ? 'edit' : 'view',
          createdAt: s.created_at,
          expiresAt: s.expires_at || undefined,
          viewCount: s.access_count,
          downloadCount: 0,
          isPasswordProtected: false
        })))
      }

      if (activitiesRes.data) {
        setActivities(activitiesRes.data.map((a: DbFileActivity) => ({
          id: a.id,
          fileId: a.file_id,
          fileName: a.files?.name || 'Unknown file',
          action: mapActivityType(a.activity),
          user: 'You',
          timestamp: a.created_at
        })))
      }
    } catch (err) {
      console.error('Error fetching shared links/activities:', err)
    }
  }, [])

  // Refetch all data (combines API hook refetch with manual fetch)
  const refetchAllData = useCallback(async () => {
    await Promise.all([
      refetchFiles(),
      refetchFolders(),
      refetchStorageStats(),
      fetchData()
    ])
  }, [refetchFiles, refetchFolders, refetchStorageStats, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle advanced upload completion
  const handleAdvancedUploadComplete = useCallback(async (uploadedFiles: UploadedFile[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create file records in database for each uploaded file
      for (const file of uploadedFiles) {
        const extension = file.name.split('.').pop() || ''
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' :
                        file.type.includes('pdf') || file.type.includes('document') ? 'document' :
                        file.type.includes('spreadsheet') || file.type.includes('excel') ? 'spreadsheet' :
                        file.type.includes('presentation') || file.type.includes('powerpoint') ? 'presentation' :
                        file.type.includes('zip') || file.type.includes('archive') ? 'archive' : 'other'

        await supabase.from('files').insert({
          user_id: user.id,
          folder_id: currentFolderId,
          name: file.name,
          type: fileType,
          extension,
          size: file.size,
          url: file.url,
          status: 'active'
        })
      }

      setShowAdvancedUpload(false)
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
      fetchData()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to save uploaded files')
    }
  }, [currentFolderId, fetchData])

  // Stats - using API storage stats with local fallback
  const stats: StorageStats = useMemo(() => {
    // Use API storage stats if available
    if (storageStatsData) {
      return {
        totalSpace: storageStatsData.total_space || 15 * 1024 * 1024 * 1024,
        usedSpace: storageStatsData.used_space || 0,
        fileCount: storageStatsData.file_count || files.length,
        folderCount: storageStatsData.folder_count || folders.length,
        sharedFiles: storageStatsData.shared_files || files.filter(f => f.isShared).length,
        starredFiles: storageStatsData.starred_files || files.filter(f => f.isStarred).length,
        recentFiles: storageStatsData.recent_files || files.filter(f => new Date(f.modifiedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        trashedFiles: storageStatsData.trashed_files || 0
      }
    }
    // Fallback to computed stats
    return {
      totalSpace: 15 * 1024 * 1024 * 1024, // 15 GB default
      usedSpace: files.reduce((sum, f) => sum + f.size, 0) + folders.reduce((sum, f) => sum + f.size, 0),
      fileCount: files.length,
      folderCount: folders.length,
      sharedFiles: files.filter(f => f.isShared).length,
      starredFiles: files.filter(f => f.isStarred).length,
      recentFiles: files.filter(f => new Date(f.modifiedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      trashedFiles: 0
    }
  }, [files, folders, storageStatsData])

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

  // CRUD Handlers - Using production-ready API mutations
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }
    setIsSubmitting(true)
    try {
      const parentPath = currentFolderId
        ? folders.find(f => f.id === currentFolderId)?.path || '/'
        : '/'

      await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        parent_id: currentFolderId || undefined,
        path: `${parentPath}/${newFolderName.trim()}`,
        color: newFolderColor
      })

      setNewFolderName('')
      setShowCreateFolderDialog(false)
      fetchData() // Refresh activities
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFile = async (fileId: string, _fileName: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId)
      fetchData() // Refresh activities
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleToggleStar = async (fileId: string, currentlyStarred: boolean) => {
    try {
      await starFileMutation.mutateAsync({ id: fileId, isStarred: !currentlyStarred })
    } catch (error) {
      // Error handled by mutation
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

      // Update file to mark as shared using mutation
      await updateFileMutation.mutateAsync({ id: fileId, updates: { is_shared: true } })
      toast.success(`"${fileName}" has been shared`)
      fetchData() // Refresh shared links
    } catch (error) {
      toast.error('Failed to share file')
    }
  }

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    try {
      const { error } = await supabase.from('folders').delete().eq('id', folderId)
      if (error) throw error
      toast.success(`Folder "${folderName}" has been deleted`)
      if (currentFolderId === folderId) setCurrentFolderId(null)
      refetchFolders()
    } catch (error) {
      toast.error('Failed to delete folder')
    }
  }

  // Move file handler - using API mutation
  const handleMoveFile = async (fileId: string, targetFolderId: string | null, _fileName: string) => {
    try {
      await moveFileMutation.mutateAsync({ fileId, folderId: targetFolderId })
      fetchData() // Refresh activities
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Rename file handler - using API mutation
  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      await updateFileMutation.mutateAsync({ id: fileId, updates: { original_name: newName } })
      toast.success(`File renamed to "${newName}"`)
      fetchData() // Refresh activities
    } catch (error) {
      // Error handled by mutation
    }
  }

  // File upload handler - using API mutation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    try {
      toast.loading('Uploading files...')

      // Prepare upload data for multiple files
      const uploads = Array.from(uploadedFiles).map(file => ({
        file,
        folder_id: currentFolderId || undefined
      }))

      if (uploads.length === 1) {
        // Single file upload
        await uploadFileMutation.mutateAsync(uploads[0])
      } else {
        // Multiple file upload
        await uploadFilesMutation.mutateAsync(uploads)
      }

      toast.dismiss()
      fetchData() // Refresh activities

    } catch (error) {
      toast.dismiss()
      // Error handled by mutation
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // File download handler - using API mutation
  const handleDownloadFile = async (file: FileItem) => {
    try {
      toast.loading('Preparing download...')
      await downloadFileMutation.mutateAsync(file.id)
      toast.dismiss()
    } catch (error) {
      toast.dismiss()
      // Error handled by mutation
    }
  }

  // Revoke share link handler
  const handleRevokeShareLink = async (linkId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to revoke access to "${fileName}"? This action cannot be undone.`)) {
      return
    }

    try {
      toast.loading('Revoking access...')
      const { error } = await supabase.from('file_shares').delete().eq('id', linkId)
      if (error) throw error
      toast.dismiss()
      toast.success(`Access to "${fileName}" has been revoked`)
      fetchData()
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to revoke access')
    }
  }

  // Copy share link handler
  const handleCopyShareLink = async (fileId: string, fileName: string) => {
    const shareUrl = `${window.location.origin}/shared/${fileId}`
    await copyToClipboard(shareUrl, `Share link for "${fileName}" copied to clipboard`)
  }

  // Define quick actions for the toolbar
  const quickActions = [
    { id: '1', label: 'Upload Files', icon: Upload, action: () => fileInputRef.current?.click(), variant: 'primary' as const },
    { id: '2', label: 'New Folder', icon: FolderPlus, action: () => setShowCreateFolderDialog(true), variant: 'secondary' as const },
    { id: '3', label: 'Refresh', icon: RefreshCw, action: () => refetchAllData(), variant: 'ghost' as const },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:bg-none dark:bg-gray-900 rounded-xl overflow-hidden">
        <div className="mx-auto p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading your files...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:bg-none dark:bg-gray-900">
        <div className="mx-auto p-6 space-y-6">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertOctagon className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Files</h3>
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
                <Button variant="outline" className="ml-auto" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:bg-none dark:bg-gray-900">
      <div className="mx-auto p-6 space-y-6">
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
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept="*/*"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Quick Upload
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => setShowAdvancedUpload(true)}>
                <CloudUpload className="w-4 h-4 mr-2" />
                Advanced Upload
              </Button>
            </>
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
                {sharedLinks.length}
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
            <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
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
            {filteredFiles.length === 0 && currentFolders.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {currentFolderId ? 'This folder is empty' : 'No files yet'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {currentFolderId
                      ? 'Upload files to this folder to get started'
                      : 'Upload your first file to get started'}
                  </p>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </CardContent>
              </Card>
            ) : (
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
                              <Button variant="ghost" size="sm" onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFileForOptions(file)
                                setShowFileOptionsDialog(true)
                              }}>
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
            )}
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
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(file)}>
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
                {sharedLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">No shared files</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Share a file to create a shareable link
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sharedLinks.map((link) => (
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
                          <Button variant="ghost" size="sm" onClick={() => handleCopyShareLink(link.fileId, link.fileName)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload, share, or modify files to see activity here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                          {activity.action === 'modified' && <Edit className="w-4 h-4 text-cyan-600" />}
                          {activity.action === 'shared' && <Share2 className="w-4 h-4 text-green-600" />}
                          {activity.action === 'downloaded' && <Download className="w-4 h-4 text-blue-600" />}
                          {activity.action === 'created' && <Plus className="w-4 h-4 text-purple-600" />}
                          {activity.action === 'moved' && <FolderOpen className="w-4 h-4 text-orange-600" />}
                          {activity.action === 'renamed' && <Edit className="w-4 h-4 text-yellow-600" />}
                          {activity.action === 'deleted' && <Trash2 className="w-4 h-4 text-red-600" />}
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
                )}
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
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-cyan-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-sync Enabled</p>
                            <p className="text-sm text-gray-500">Sync files automatically</p>
                          </div>
                        </div>
                        <Switch
                          checked={autoSyncEnabled}
                          onCheckedChange={(checked) => {
                            setAutoSyncEnabled(checked)
                            toast.success(checked ? 'Auto-sync enabled' : 'Auto-sync disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Smart Sync</p>
                            <p className="text-sm text-gray-500">Only download files when accessed</p>
                          </div>
                        </div>
                        <Switch
                          checked={smartSyncEnabled}
                          onCheckedChange={(checked) => {
                            setSmartSyncEnabled(checked)
                            toast.success(checked ? 'Smart sync enabled' : 'Smart sync disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sync on Wi-Fi Only</p>
                            <p className="text-sm text-gray-500">Save mobile data</p>
                          </div>
                        </div>
                        <Switch
                          checked={syncOnWifiOnly}
                          onCheckedChange={(checked) => {
                            setSyncOnWifiOnly(checked)
                            toast.success(checked ? 'Wi-Fi only sync enabled' : 'Wi-Fi only sync disabled')
                          }}
                        />
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
                      <Button variant="outline" className="w-full" onClick={() => setShowClearCacheDialog(true)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Local Cache
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600" onClick={() => setShowUpgradeStorageDialog(true)}>
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
                        <div className="flex items-center gap-2">
                          <CloudOff className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Offline Access</p>
                            <p className="text-sm text-gray-500">Access files without internet</p>
                          </div>
                        </div>
                        <Switch
                          checked={offlineAccessEnabled}
                          onCheckedChange={(checked) => {
                            setOfflineAccessEnabled(checked)
                            toast.success(checked ? 'Offline access enabled' : 'Offline access disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-download Starred</p>
                            <p className="text-sm text-gray-500">Keep starred files offline</p>
                          </div>
                        </div>
                        <Switch
                          checked={autoDownloadStarred}
                          onCheckedChange={(checked) => {
                            setAutoDownloadStarred(checked)
                            toast.success(checked ? 'Starred files will be downloaded' : 'Starred auto-download disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-download Shared</p>
                            <p className="text-sm text-gray-500">Keep shared files offline</p>
                          </div>
                        </div>
                        <Switch
                          checked={autoDownloadShared}
                          onCheckedChange={(checked) => {
                            setAutoDownloadShared(checked)
                            toast.success(checked ? 'Shared files will be downloaded' : 'Shared auto-download disabled')
                          }}
                        />
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
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                            setSelectedDevice({ name: device.name, type: device.type })
                            setShowUnlinkDeviceDialog(true)
                          }}>Unlink</Button>
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
                        <div className="flex items-center gap-2">
                          <LockKeyhole className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Password</p>
                            <p className="text-sm text-gray-500">Password protect shared links</p>
                          </div>
                        </div>
                        <Switch
                          checked={requirePassword}
                          onCheckedChange={(checked) => {
                            setRequirePassword(checked)
                            toast.success(checked ? 'Password protection enabled' : 'Password protection disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Downloads</p>
                            <p className="text-sm text-gray-500">Let viewers download files</p>
                          </div>
                        </div>
                        <Switch
                          checked={allowDownloads}
                          onCheckedChange={(checked) => {
                            setAllowDownloads(checked)
                            toast.success(checked ? 'Downloads allowed' : 'Downloads disabled')
                          }}
                        />
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
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Team Folder Access</p>
                            <p className="text-sm text-gray-500">Allow team members to view folders</p>
                          </div>
                        </div>
                        <Switch
                          checked={teamFolderAccess}
                          onCheckedChange={(checked) => {
                            setTeamFolderAccess(checked)
                            toast.success(checked ? 'Team folder access enabled' : 'Team folder access disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Request Access</p>
                            <p className="text-sm text-gray-500">Allow requesting access to files</p>
                          </div>
                        </div>
                        <Switch
                          checked={requestAccessEnabled}
                          onCheckedChange={(checked) => {
                            setRequestAccessEnabled(checked)
                            toast.success(checked ? 'Access requests enabled' : 'Access requests disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">External Sharing</p>
                            <p className="text-sm text-gray-500">Share with people outside team</p>
                          </div>
                        </div>
                        <Switch
                          checked={externalSharing}
                          onCheckedChange={(checked) => {
                            setExternalSharing(checked)
                            toast.success(checked ? 'External sharing enabled' : 'External sharing disabled')
                          }}
                        />
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
                        {sharedLinks.map((link) => (
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
                              <Button variant="ghost" size="sm" onClick={() => handleCopyShareLink(link.fileId, link.fileName)}><Copy className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleRevokeShareLink(link.id, link.fileName)}><Trash2 className="w-4 h-4" /></Button>
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
                        <div className="flex items-center gap-2">
                          <FileEdit className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">File Changes</p>
                            <p className="text-sm text-gray-500">When files are modified</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifyFileChanges}
                          onCheckedChange={(checked) => {
                            setNotifyFileChanges(checked)
                            toast.success(checked ? 'File change notifications enabled' : 'File change notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">New Shares</p>
                            <p className="text-sm text-gray-500">When files are shared with you</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifyNewShares}
                          onCheckedChange={(checked) => {
                            setNotifyNewShares(checked)
                            toast.success(checked ? 'Share notifications enabled' : 'Share notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Comments & Mentions</p>
                            <p className="text-sm text-gray-500">When you're mentioned in comments</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifyCommentsMentions}
                          onCheckedChange={(checked) => {
                            setNotifyCommentsMentions(checked)
                            toast.success(checked ? 'Mention notifications enabled' : 'Mention notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Weekly Summary</p>
                            <p className="text-sm text-gray-500">Weekly activity digest</p>
                          </div>
                        </div>
                        <Switch
                          checked={weeklySummary}
                          onCheckedChange={(checked) => {
                            setWeeklySummary(checked)
                            toast.success(checked ? 'Weekly summary enabled' : 'Weekly summary disabled')
                          }}
                        />
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
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
                            <p className="text-sm text-gray-500">Show desktop alerts</p>
                          </div>
                        </div>
                        <Switch
                          checked={desktopNotifications}
                          onCheckedChange={(checked) => {
                            setDesktopNotifications(checked)
                            toast.success(checked ? 'Desktop notifications enabled' : 'Desktop notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Mobile Notifications</p>
                            <p className="text-sm text-gray-500">Push to mobile devices</p>
                          </div>
                        </div>
                        <Switch
                          checked={mobileNotifications}
                          onCheckedChange={(checked) => {
                            setMobileNotifications(checked)
                            toast.success(checked ? 'Mobile notifications enabled' : 'Mobile notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sync Complete</p>
                            <p className="text-sm text-gray-500">Notify when sync finishes</p>
                          </div>
                        </div>
                        <Switch
                          checked={syncCompleteNotify}
                          onCheckedChange={(checked) => {
                            setSyncCompleteNotify(checked)
                            toast.success(checked ? 'Sync complete notifications enabled' : 'Sync complete notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Storage Alerts</p>
                            <p className="text-sm text-gray-500">When storage is nearly full</p>
                          </div>
                        </div>
                        <Switch
                          checked={storageAlerts}
                          onCheckedChange={(checked) => {
                            setStorageAlerts(checked)
                            toast.success(checked ? 'Storage alerts enabled' : 'Storage alerts disabled')
                          }}
                        />
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
                      {folders.slice(0, 4).map((folder) => (
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
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">File Uploads</p>
                            <p className="text-sm text-gray-500">Notify on new uploads</p>
                          </div>
                        </div>
                        <Switch
                          checked={slackFileUploads}
                          onCheckedChange={(checked) => {
                            setSlackFileUploads(checked)
                            toast.success(checked ? 'Slack upload notifications enabled' : 'Slack upload notifications disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Share Activity</p>
                            <p className="text-sm text-gray-500">Post when files are shared</p>
                          </div>
                        </div>
                        <Switch
                          checked={slackShareActivity}
                          onCheckedChange={(checked) => {
                            setSlackShareActivity(checked)
                            toast.success(checked ? 'Slack share notifications enabled' : 'Slack share notifications disabled')
                          }}
                        />
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
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedApp({ name: app.name, desc: app.desc })
                                setShowConnectAppDialog(true)
                              }}>Connect</Button>
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
                      <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
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
                          <Input value="fh_live_xxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono text-sm" type={showApiKey ? 'text' : 'password'} />
                          <Button variant="outline" size="icon" onClick={() => {
                            setShowApiKey(!showApiKey)
                            toast.success(showApiKey ? 'API key hidden' : 'API key revealed')
                          }}><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard('fh_live_xxxxxxxxxxxxxxxxxxxxx', 'API key copied to clipboard')}><Copy className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Keep your API key secure. Never share it in public repositories.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setShowRegenerateApiKeyDialog(true)}>
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
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Extra security for your account</p>
                          </div>
                        </div>
                        <Switch
                          checked={twoFactorAuth}
                          onCheckedChange={(checked) => {
                            setTwoFactorAuth(checked)
                            toast.success(checked ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Enforcement</p>
                            <p className="text-sm text-gray-500">Require SSO login</p>
                          </div>
                        </div>
                        <Switch
                          checked={ssoEnforcement}
                          onCheckedChange={(checked) => {
                            setSsoEnforcement(checked)
                            toast.success(checked ? 'SSO enforcement enabled' : 'SSO enforcement disabled')
                          }}
                        />
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
                        <div className="flex items-center gap-2">
                          <Eraser className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Remote Wipe</p>
                            <p className="text-sm text-gray-500">Allow wiping devices remotely</p>
                          </div>
                        </div>
                        <Switch
                          checked={remoteWipe}
                          onCheckedChange={(checked) => {
                            setRemoteWipe(checked)
                            toast.success(checked ? 'Remote wipe enabled' : 'Remote wipe disabled')
                          }}
                        />
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
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">End-to-End Encryption</p>
                            <p className="text-sm text-gray-500">Encrypt files before upload</p>
                          </div>
                        </div>
                        <Switch
                          checked={endToEndEncryption}
                          onCheckedChange={(checked) => {
                            setEndToEndEncryption(checked)
                            toast.success(checked ? 'End-to-end encryption enabled' : 'End-to-end encryption disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldOff className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Zero-Knowledge</p>
                            <p className="text-sm text-gray-500">Only you can decrypt files</p>
                          </div>
                        </div>
                        <Switch
                          checked={zeroKnowledge}
                          onCheckedChange={(checked) => {
                            setZeroKnowledge(checked)
                            toast.success(checked ? 'Zero-knowledge mode enabled' : 'Zero-knowledge mode disabled')
                          }}
                        />
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
                          <Input value={showEncryptionKey ? 'enc_aes256_xxxxxxxxxxxxx' : '•••••••••••••••••••••'} readOnly className="flex-1 font-mono" />
                          <Button variant="outline" size="icon" onClick={() => {
                            setShowEncryptionKey(!showEncryptionKey)
                            toast.success(showEncryptionKey ? 'Encryption key hidden' : 'Encryption key revealed')
                          }}><Eye className="w-4 h-4" /></Button>
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
                        <div className="flex items-center gap-2">
                          <ScrollText className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Audit Logging</p>
                            <p className="text-sm text-gray-500">Track all file activities</p>
                          </div>
                        </div>
                        <Switch
                          checked={auditLogging}
                          onCheckedChange={(checked) => {
                            setAuditLogging(checked)
                            toast.success(checked ? 'Audit logging enabled' : 'Audit logging disabled')
                          }}
                        />
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
                      <Button variant="outline" className="w-full" onClick={() => setShowExportAuditLogDialog(true)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Audit Log
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowViewAuditLogDialog(true)}>
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
                        <div className="flex items-center gap-2">
                          <ToggleRight className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
                            <p className="text-sm text-gray-500">Restrict access by IP</p>
                          </div>
                        </div>
                        <Switch
                          checked={ipWhitelist}
                          onCheckedChange={(checked) => {
                            setIpWhitelist(checked)
                            toast.success(checked ? 'IP whitelist enabled' : 'IP whitelist disabled')
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Allowed IP Ranges</Label>
                        <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Geo-Restrictions</p>
                            <p className="text-sm text-gray-500">Limit by country</p>
                          </div>
                        </div>
                        <Switch
                          checked={geoRestrictions}
                          onCheckedChange={(checked) => {
                            setGeoRestrictions(checked)
                            toast.success(checked ? 'Geo-restrictions enabled' : 'Geo-restrictions disabled')
                          }}
                        />
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
                      <Button variant="outline" className="w-full" onClick={() => setShowExportDataDialog(true)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowEmptyTrashDialog(true)}>
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
                        <div className="flex items-center gap-2">
                          <HardDriveDownload className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Automatic Backups</p>
                            <p className="text-sm text-gray-500">Backup files automatically</p>
                          </div>
                        </div>
                        <Switch
                          checked={automaticBackups}
                          onCheckedChange={(checked) => {
                            setAutomaticBackups(checked)
                            toast.success(checked ? 'Automatic backups enabled' : 'Automatic backups disabled')
                          }}
                        />
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
                      <Button variant="outline" className="w-full" onClick={() => setShowCreateBackupDialog(true)}>
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
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show File Extensions</p>
                            <p className="text-sm text-gray-500">Display file extensions</p>
                          </div>
                        </div>
                        <Switch
                          checked={showFileExtensions}
                          onCheckedChange={(checked) => {
                            setShowFileExtensions(checked)
                            toast.success(checked ? 'File extensions visible' : 'File extensions hidden')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileQuestion className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Hidden Files</p>
                            <p className="text-sm text-gray-500">Display hidden files</p>
                          </div>
                        </div>
                        <Switch
                          checked={showHiddenFiles}
                          onCheckedChange={(checked) => {
                            setShowHiddenFiles(checked)
                            toast.success(checked ? 'Hidden files visible' : 'Hidden files hidden')
                          }}
                        />
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
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteAllFilesDialog(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All Files
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowRevokeAllLinksDialog(true)}>
                        <Link2 className="w-4 h-4 mr-2" />
                        Revoke All Shared Links
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDisableFilesHubDialog(true)}>
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


        {/* File Detail Dialog */}
        <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>File Details</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="space-y-4">
                {/* File Preview for Images */}
                {selectedFile.type === 'image' && selectedFile.path && (
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={selectedFile.path}
                      alt={selectedFile.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                {/* Video Preview */}
                {selectedFile.type === 'video' && selectedFile.path && (
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      src={selectedFile.path}
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => handleDownloadFile(selectedFile)}>
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

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>File Type</Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as FileType | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="archive">Archives</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                    <SelectItem value="presentation">Presentations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="modified">Last Modified</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setFilterType('all')
                setSortBy('modified')
              }}>Reset Filters</Button>
              <Button onClick={() => {
                setShowFilterDialog(false)
                toast.success('Filters applied')
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* File Options Dialog */}
        <Dialog open={showFileOptionsDialog} onOpenChange={setShowFileOptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File Options</DialogTitle>
            </DialogHeader>
            {selectedFileForOptions && (
              <div className="space-y-2 py-4">
                <p className="text-sm text-gray-500 mb-4">Options for: {selectedFileForOptions.name}</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  handleDownloadFile(selectedFileForOptions)
                  setShowFileOptionsDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  handleShareFile(selectedFileForOptions.id, selectedFileForOptions.name)
                  setShowFileOptionsDialog(false)
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  handleToggleStar(selectedFileForOptions.id, selectedFileForOptions.isStarred)
                  setShowFileOptionsDialog(false)
                }}>
                  <Star className={`w-4 h-4 mr-2 ${selectedFileForOptions.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {selectedFileForOptions.isStarred ? 'Remove Star' : 'Add Star'}
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => {
                  handleDeleteFile(selectedFileForOptions.id, selectedFileForOptions.name)
                  setShowFileOptionsDialog(false)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Clear Cache Dialog */}
        <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Local Cache</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300">
                This will clear all locally cached files. Files will be re-downloaded when accessed.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Current cache size: ~2.5 GB
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Local cache cleared')
                setShowClearCacheDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Clear Cache
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upgrade Storage Dialog */}
        <Dialog open={showUpgradeStorageDialog} onOpenChange={setShowUpgradeStorageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upgrade Storage Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold text-lg">Pro Plan</h4>
                <p className="text-2xl font-bold text-cyan-600">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>100 GB Storage</li>
                  <li>Advanced sharing controls</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-cyan-500 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                <Badge className="bg-cyan-500 text-white mb-2">Recommended</Badge>
                <h4 className="font-semibold text-lg">Business Plan</h4>
                <p className="text-2xl font-bold text-cyan-600">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>1 TB Storage</li>
                  <li>Team collaboration features</li>
                  <li>Admin controls</li>
                  <li>24/7 priority support</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpgradeStorageDialog(false)}>Maybe Later</Button>
              <Button onClick={() => {
                toast.success('Redirecting to checkout...')
                setShowUpgradeStorageDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Upgrade Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unlink Device Dialog */}
        <Dialog open={showUnlinkDeviceDialog} onOpenChange={setShowUnlinkDeviceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlink Device</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to unlink <strong>{selectedDevice?.name}</strong>? This device will no longer sync with your Files Hub.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUnlinkDeviceDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(`${selectedDevice?.name || 'Device'} has been removed`)
                setShowUnlinkDeviceDialog(false)
              }} variant="destructive">
                Unlink Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Connect App Dialog */}
        <Dialog open={showConnectAppDialog} onOpenChange={setShowConnectAppDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {selectedApp?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect {selectedApp?.name} to enable {selectedApp?.desc?.toLowerCase()}.
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">
                  You will be redirected to {selectedApp?.name} to authorize the connection. This allows Files Hub to:
                </p>
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                  <li>Access your files</li>
                  <li>Sync changes automatically</li>
                  <li>Share files across platforms</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectAppDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(`Connecting to ${selectedApp?.name}...`)
                setShowConnectAppDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Webhook Dialog */}
        <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://api.yourapp.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={webhookEvent} onValueChange={setWebhookEvent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                    <SelectItem value="file_delete">File Delete</SelectItem>
                    <SelectItem value="file_share">File Share</SelectItem>
                    <SelectItem value="file_download">File Download</SelectItem>
                    <SelectItem value="all">All Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddWebhookDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!webhookUrl) {
                  toast.error('Please enter a webhook URL')
                  return
                }
                toast.success('Webhook added')
                setWebhookUrl('')
                setWebhookEvent('file_upload')
                setShowAddWebhookDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Add Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> Regenerating your API key will invalidate your current key. Any applications using the old key will stop working.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('API key regenerated')
                setShowRegenerateApiKeyDialog(false)
              }} variant="destructive">
                Regenerate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Audit Log Dialog */}
        <Dialog open={showExportAuditLogDialog} onOpenChange={setShowExportAuditLogDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Audit Log</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportAuditLogDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Exporting audit log...')
                setShowExportAuditLogDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Audit Log Dialog */}
        <Dialog open={showViewAuditLogDialog} onOpenChange={setShowViewAuditLogDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Audit Log</DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewAuditLogDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export All Data</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Export all your files and data from Files Hub. This may take some time depending on the amount of data.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Total data to export: {formatSize(stats.usedSpace)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Export started')
                setShowExportDataDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Start Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Empty Trash Dialog */}
        <Dialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Empty Trash</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This will permanently delete all files in your trash. This action cannot be undone.
                </p>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Items in trash: {stats.trashedFiles} files
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmptyTrashDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Trash emptied')
                setShowEmptyTrashDialog(false)
              }} variant="destructive">
                Empty Trash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Backup Dialog */}
        <Dialog open={showCreateBackupDialog} onOpenChange={setShowCreateBackupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Backup</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create a full backup of all your files and settings. The backup will be stored securely in our cloud.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Estimated backup size: {formatSize(stats.usedSpace)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateBackupDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Backup started')
                setShowCreateBackupDialog(false)
              }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Create Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Files Dialog */}
        <Dialog open={showDeleteAllFilesDialog} onOpenChange={setShowDeleteAllFilesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete All Files</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>DANGER:</strong> This will permanently delete ALL {stats.fileCount} files. This action cannot be undone.
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Type &quot;DELETE ALL&quot; to confirm</Label>
                <Input placeholder="DELETE ALL" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllFilesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.error('All files deleted')
                setShowDeleteAllFilesDialog(false)
              }} variant="destructive">
                Delete All Files
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke All Links Dialog */}
        <Dialog open={showRevokeAllLinksDialog} onOpenChange={setShowRevokeAllLinksDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Revoke All Shared Links</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This will revoke all {stats.sharedFiles} shared links. Anyone with existing links will lose access immediately.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRevokeAllLinksDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('All shared links revoked')
                setShowRevokeAllLinksDialog(false)
              }} variant="destructive">
                Revoke All Links
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Reset All Settings</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This will reset all Files Hub settings to their defaults. Your files will not be affected.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Settings reset')
                setShowResetSettingsDialog(false)
              }} variant="destructive">
                Reset Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disable Files Hub Dialog */}
        <Dialog open={showDisableFilesHubDialog} onOpenChange={setShowDisableFilesHubDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Disable Files Hub</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>DANGER:</strong> Disabling Files Hub will stop all syncing and remove access to your files from all devices. Your data will be retained for 30 days.
                </p>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                You can re-enable Files Hub at any time from your account settings.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisableFilesHubDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.error('Files Hub disabled')
                setShowDisableFilesHubDialog(false)
              }} variant="destructive">
                Disable Files Hub
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Advanced File Upload Dialog - World-class drag & drop component */}
        <Dialog open={showAdvancedUpload} onOpenChange={setShowAdvancedUpload}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-cyan-500" />
                Advanced File Upload
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AdvancedFileUpload
                bucket="files"
                path={currentFolderId || 'root'}
                maxFiles={20}
                maxSizeMB={100}
                showPreview={true}
                onUploadComplete={handleAdvancedUploadComplete}
                onUploadError={(error) => toast.error(`Upload failed: ${error.message}`)}
              />
              <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                <p className="text-sm text-cyan-800 dark:text-cyan-200">
                  <strong>Pro tip:</strong> Drag & drop multiple files or click to browse. Supports images, videos, documents, and more.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdvancedUpload(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
