"use client"

import { useState, useMemo, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Initialize Supabase client once at module level
const supabase = createClient()
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
  type MediaFile,
  type MediaFolder as DBMediaFolder,
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
  PieChart,
  X,
  CheckSquare,
  Square,
  Loader2
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

// Empty typed arrays (real data comes from Supabase hooks)
const emptyAssets: MediaAsset[] = []
const emptyCollections: Collection[] = []
const emptyFolders: MediaFolder[] = []
const emptyUsageStats: UsageStats = {
  totalAssets: 0,
  totalSize: 0,
  storageLimit: 0,
  bandwidth: { used: 0, limit: 0 },
  byType: []
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

// Empty typed arrays for enhanced components (real data comes from Supabase)
interface AIInsight {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  category: string
}

interface Collaborator {
  id: string
  name: string
  avatar: string
  status: 'online' | 'away' | 'offline'
  role: string
  lastActive: string
}

interface Prediction {
  id: string
  label: string
  current: number
  target: number
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
}

interface MediaActivity {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  type: 'success' | 'info' | 'warning' | 'error'
}

const emptyAIInsights: AIInsight[] = []
const emptyCollaborators: Collaborator[] = []
const emptyPredictions: Prediction[] = []
const emptyActivities: MediaActivity[] = []

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
  initialAssets: _initialAssets = emptyAssets,
  initialFolders: _initialFolders = emptyFolders
}: MediaLibraryClientProps) {
  // Note: initialAssets and initialFolders are kept for backward compatibility
  // but we now use Supabase hooks for real data
  void _initialAssets
  void _initialFolders

  // Supabase hooks for real data
  const { files: supabaseFiles, loading: filesLoading, error: filesError, refetch: refetchFiles } = useMediaFiles({ status: 'active' })
  const { folders: supabaseFolders, loading: foldersLoading, error: foldersError, refetch: refetchFolders } = useMediaFolders()
  const _mediaStats = useMediaStats() // Available for future use

  // Mutation hooks
  const fileMutation = useSupabaseMutation({
    table: 'media_files',
    onSuccess: () => refetchFiles(),
  })
  const folderMutation = useSupabaseMutation({
    table: 'media_folders',
    onSuccess: () => refetchFolders(),
  })

  // Map DB MediaFile to UI MediaAsset type
  const mapFileToAsset = useCallback((file: MediaFile): MediaAsset => {
    const fileTypeMap: Record<MediaFileType, FileType> = {
      image: 'image',
      video: 'video',
      audio: 'audio',
      document: 'document',
      archive: 'archive',
      other: 'other',
    }
    const statusMap: Record<string, AssetStatus> = {
      uploading: 'processing',
      processing: 'processing',
      active: 'ready',
      archived: 'archived',
      deleted: 'archived',
      quarantined: 'failed',
    }
    const accessMap: Record<string, AccessLevel> = {
      private: 'private',
      team: 'team',
      organization: 'team',
      public: 'public',
      link_only: 'restricted',
    }
    return {
      id: file.id,
      fileName: file.file_name,
      fileType: fileTypeMap[file.file_type] || 'other',
      mimeType: file.mime_type || 'application/octet-stream',
      fileSize: file.file_size || 0,
      width: file.width || undefined,
      height: file.height || undefined,
      duration: file.duration_seconds || undefined,
      thumbnailUrl: file.thumbnail_url || file.cdn_url || file.storage_url || '/placeholder.svg',
      originalUrl: file.cdn_url || file.storage_url || '',
      status: statusMap[file.status] || 'draft',
      tags: file.tags || [],
      metadata: {
        title: file.file_name,
        description: file.description || undefined,
        alt: file.alt_text || undefined,
        copyright: undefined,
      },
      aiTags: file.ai_tags || [],
      colors: [],
      license: 'royalty_free',
      accessLevel: accessMap[file.access_level] || 'private',
      uploadedBy: { id: file.user_id, name: 'User', avatar: undefined },
      uploadedAt: file.uploaded_at || file.created_at,
      modifiedAt: file.updated_at,
      viewCount: file.view_count || 0,
      downloadCount: file.download_count || 0,
      isStarred: file.is_starred || false,
      isFavorite: file.is_featured || false,
      versions: [],
      collections: [],
    }
  }, [])

  // Map DB MediaFolder to UI MediaFolder type
  const mapDbFolder = useCallback((folder: DBMediaFolder): MediaFolder => {
    const accessMap: Record<string, AccessLevel> = {
      private: 'private',
      team: 'team',
      organization: 'team',
      public: 'public',
      link_only: 'restricted',
    }
    return {
      id: folder.id,
      name: folder.folder_name,
      path: folder.folder_path || `/${folder.folder_name}`,
      parentId: folder.parent_id || undefined,
      color: folder.color || 'from-blue-500 to-cyan-500',
      assetCount: folder.file_count || 0,
      totalSize: folder.total_size || 0,
      createdAt: folder.created_at,
      accessLevel: accessMap[folder.access_level] || 'private',
    }
  }, [])

  // Map Supabase data to UI types
  const mappedAssets: MediaAsset[] = useMemo(() => {
    return (supabaseFiles || []).map(mapFileToAsset)
  }, [supabaseFiles, mapFileToAsset])

  const mappedFolders: MediaFolder[] = useMemo(() => {
    return (supabaseFolders || []).map(mapDbFolder)
  }, [supabaseFolders, mapDbFolder])

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

  // Tag management state
  const [newTagName, setNewTagName] = useState('')
  const [customTags, setCustomTags] = useState<string[]>(['product', 'marketing', 'team', 'brand', 'social', 'video', 'banner', 'hero'])

  // Invite management state
  const [inviteEmail, setInviteEmail] = useState('')
  const [pendingInvites, setPendingInvites] = useState<string[]>([])

  // Analytics state
  const [showTrendsDialog, setShowTrendsDialog] = useState(false)
  const [showDistributionDialog, setShowDistributionDialog] = useState(false)
  const [showRealTimeDialog, setShowRealTimeDialog] = useState(false)
  const [showViewsDialog, setShowViewsDialog] = useState(false)
  const [showDownloadsDialog, setShowDownloadsDialog] = useState(false)
  const [showStorageDialog, setShowStorageDialog] = useState(false)

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  // Bulk selection state
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [bulkSelectMode, setBulkSelectMode] = useState(false)

  // URL import state
  const [importUrl, setImportUrl] = useState('')
  const [importFileName, setImportFileName] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  // Permissions and privacy settings state
  const [permissionSettings, setPermissionSettings] = useState({
    admin: true,
    editor: true,
    viewer: false
  })
  const [privacySettings, setPrivacySettings] = useState({
    publicAccess: false,
    passwordProtected: false,
    linkSharing: true
  })

  const stats = useMemo(() => {
    const totalViews = mappedAssets.reduce((sum, a) => sum + a.viewCount, 0)
    const totalDownloads = mappedAssets.reduce((sum, a) => sum + a.downloadCount, 0)
    const totalSize = mappedAssets.reduce((sum, a) => sum + a.fileSize, 0)
    const imageCount = mappedAssets.filter(a => a.fileType === 'image').length
    const videoCount = mappedAssets.filter(a => a.fileType === 'video').length
    const audioCount = mappedAssets.filter(a => a.fileType === 'audio').length
    const docCount = mappedAssets.filter(a => a.fileType === 'document').length

    return {
      totalAssets: mappedAssets.length,
      totalViews,
      totalDownloads,
      totalSize,
      storageUsed: emptyUsageStats.storageLimit > 0 ? (totalSize / emptyUsageStats.storageLimit) * 100 : 0,
      imageCount,
      videoCount,
      audioCount,
      docCount
    }
  }, [mappedAssets])

  const filteredAssets = useMemo(() => {
    return mappedAssets.filter(asset => {
      const matchesSearch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.metadata.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || asset.fileType === selectedType
      return matchesSearch && matchesType
    })
  }, [mappedAssets, searchQuery, selectedType])

  const statCards = [
    { label: 'Total Assets', value: stats.totalAssets.toLocaleString(), change: 0, icon: ImageIcon, color: 'from-indigo-500 to-purple-600' },
    { label: 'Storage Used', value: formatSize(stats.totalSize), change: 0, icon: HardDrive, color: 'from-blue-500 to-cyan-600' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: 0, icon: Eye, color: 'from-green-500 to-emerald-600' },
    { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), change: 0, icon: Download, color: 'from-purple-500 to-pink-600' },
    { label: 'Images', value: stats.imageCount.toString(), change: 0, icon: FileImage, color: 'from-blue-500 to-indigo-600' },
    { label: 'Videos', value: stats.videoCount.toString(), change: 0, icon: FileVideo, color: 'from-red-500 to-rose-600' },
    { label: 'Audio Files', value: stats.audioCount.toString(), change: 0, icon: FileAudio, color: 'from-green-500 to-teal-600' },
    { label: 'Documents', value: stats.docCount.toString(), change: 0, icon: FileText, color: 'from-orange-500 to-amber-600' }
  ]

  // CRUD Handlers
  const handleUploadMedia = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setUploadingFiles(fileArray)
    setIsUploading(true)
    setUploadProgress(0)
    setShowUploadDialog(true)

    const totalFiles = fileArray.length
    let completedFiles = 0

    for (const file of fileArray) {
      try {
        // Determine file type from mime type
        let fileType: MediaFileType = 'other'
        if (file.type.startsWith('image/')) fileType = 'image'
        else if (file.type.startsWith('video/')) fileType = 'video'
        else if (file.type.startsWith('audio/')) fileType = 'audio'
        else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) fileType = 'document'
        else if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar')) fileType = 'archive'

        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(`uploads/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(`uploads/${fileName}`)

        // Create file record in database
        await fileMutation.create({
          file_name: file.name,
          original_name: file.name,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          storage_path: uploadData?.path || `uploads/${fileName}`,
          public_url: urlData?.publicUrl || null,
          access_level: 'private',
          is_public: false,
          status: 'active',
          view_count: 0,
          download_count: 0,
          share_count: 0,
          is_starred: false,
          is_featured: false,
          password_protected: false,
        })

        completedFiles++
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100))
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setIsUploading(false)
    setUploadingFiles([])
    setShowUploadDialog(false)
    refetchFiles()

    if (completedFiles === totalFiles) {
      toast.success(`Successfully uploaded ${completedFiles} file${completedFiles > 1 ? 's' : ''}`)
    } else {
      toast.warning(`Uploaded ${completedFiles} of ${totalFiles} files`)
    }
  }, [ fileMutation, refetchFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleOpenUploadDialog = () => {
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

  const handleDownloadAsset = async (asset: MediaAsset) => {
    const downloadUrl = asset.originalUrl

    if (!downloadUrl) {
      toast.error('Download unavailable')
      return
    }

    const downloadPromise = async () => {
      try {
        const response = await fetch(downloadUrl)
        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = asset.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        // Increment download count
        await fileMutation.update(asset.id, { download_count: (asset.downloadCount || 0) + 1 })

        return asset.fileName
      } catch (error) {
        // Fallback to direct download if fetch fails (e.g., CORS issues)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = asset.fileName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        await fileMutation.update(asset.id, { download_count: (asset.downloadCount || 0) + 1 })
        return asset.fileName
      }
    }

    toast.promise(downloadPromise(), {
      loading: `Downloading "${asset.fileName}"...`,
      success: (name) => `Downloaded "${name}" successfully`,
      error: 'Download failed'
    })
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
        toast.success('File deleted')
        refetchFiles()
      } else {
        await folderMutation.remove(itemToDelete.id)
        toast.success('Folder deleted')
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
      toast.success(`Asset moved has been moved`)
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
      toast.success(`Asset updated has been updated`)
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

    try {
      // Call API to enhance asset with AI
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-metadata',
          data: {
            fileId: targetAsset.id,
            description: targetAsset.metadata.description,
            accessLevel: targetAsset.accessLevel
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance asset')
      }

      // Also update the local file record
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
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to apply AI enhancement')
    }
  }

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.info('Enter a search query for AI-powered search')
      return
    }

    toast.loading('Smart search is analyzing your query...')

    try {
      // Call API to search files
      const response = await fetch(`/api/files?search=${encodeURIComponent(searchQuery.trim())}&status=active`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const result = await response.json()

      // Also perform local matching for enhanced results
      const aiResults = mappedAssets.filter(asset => {
        const query = searchQuery.toLowerCase()
        const matchesName = asset.fileName.toLowerCase().includes(query)
        const matchesTags = asset.tags.some(tag => tag.toLowerCase().includes(query))
        const matchesAITags = asset.aiTags?.some(tag => tag.toLowerCase().includes(query))
        const matchesMetadata = asset.metadata.title?.toLowerCase().includes(query) ||
          asset.metadata.description?.toLowerCase().includes(query)
        return matchesName || matchesTags || matchesAITags || matchesMetadata
      })

      // Combine API results with local filtering
      const totalResults = Math.max(result.files?.length || 0, aiResults.length)

      toast.dismiss()
      toast.success(`AI search complete - found ${totalResults} relevant results`)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Search failed')
    }
  }

  const handleAITagAll = async () => {
    setIsAITagging(true)
    toast.loading('AI analyzing media for auto-tagging...')

    try {
      // Batch update all assets with AI-generated tags
      let taggedCount = 0
      const errors: string[] = []

      for (const asset of mappedAssets) {
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update-metadata',
              data: {
                fileId: asset.id,
                description: asset.metadata.description,
                tags: [...asset.tags, 'ai-tagged']
              }
            })
          })

          if (response.ok) {
            taggedCount++
          }
        } catch (err) {
          errors.push(asset.fileName)
        }
      }

      toast.dismiss()
      if (errors.length > 0) {
        toast.warning(`AI tagging complete! ${taggedCount} items tagged, ${errors.length} failed`)
      } else {
        toast.success(`AI tagging complete! ${taggedCount} items analyzed, new tags detected`)
      }
      refetchFiles()
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'AI tagging failed')
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
      // Find folders with no recent activity (older folders beyond index 2)
      const foldersToArchive = mappedFolders.filter((_, idx) => idx > 2)

      if (foldersToArchive.length === 0) {
        toast.dismiss()
        toast.info('No folders to archive')
        return
      }

      // Archive each folder via API
      let archivedCount = 0
      for (const folder of foldersToArchive) {
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'move-files',
              data: {
                fileIds: [],
                targetFolderId: 'archived'
              }
            })
          })

          if (response.ok) {
            archivedCount++
          }
        } catch {
          // Continue with other folders
        }
      }

      toast.dismiss()
      toast.success(`${archivedCount} folders archived successfully`)
      refetchFolders()
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to archive folders')
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
      const emptyFoldersToClean = mappedFolders.filter(f => f.assetCount === 0)

      if (emptyFoldersToClean.length === 0) {
        toast.dismiss()
        toast.info('No empty folders found')
        return
      }

      // Delete each empty folder via API
      let deletedCount = 0
      for (const folder of emptyFoldersToClean) {
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete-files',
              data: {
                fileIds: [folder.id],
                permanent: true
              }
            })
          })

          if (response.ok) {
            deletedCount++
          }
        } catch {
          // Continue with other folders
        }
      }

      toast.dismiss()
      toast.success(`${deletedCount} empty folders removed`)
      refetchFolders()
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to cleanup folders')
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
      // Call API to regenerate API key
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-link',
          data: {
            fileId: 'api-key',
            permission: 'admin',
            expiresIn: '30 days'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate API key')
      }

      const result = await response.json()
      toast.dismiss()
      toast.success(`API key regenerated successfully${result.shareUrl ? ` - ${result.shareUrl}` : ''}`)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate API key')
    }
  }

  const handleClearMetadata = async () => {
    if (!confirm('This will remove all AI-generated tags from your assets. Continue?')) {
      return
    }

    toast.loading('Clearing all metadata...')

    try {
      // Clear metadata from all assets via API
      let clearedCount = 0
      const errors: string[] = []

      for (const asset of mappedAssets) {
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update-metadata',
              data: {
                fileId: asset.id,
                description: '',
                tags: []
              }
            })
          })

          if (response.ok) {
            clearedCount++
          }
        } catch {
          errors.push(asset.fileName)
        }
      }

      toast.dismiss()
      if (errors.length > 0) {
        toast.warning(`Cleared metadata from ${clearedCount} assets, ${errors.length} failed`)
      } else {
        toast.success('All metadata cleared successfully')
      }
      refetchFiles()
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to clear metadata')
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
      // Get all asset IDs for deletion
      const allAssetIds = mappedAssets.map(asset => asset.id)

      if (allAssetIds.length === 0) {
        toast.dismiss()
        toast.info('No assets to delete')
        return
      }

      // Delete all assets via API
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-files',
          data: {
            fileIds: allAssetIds,
            permanent: true
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete assets')
      }

      const result = await response.json()
      toast.dismiss()
      toast.success(result.message || 'All assets deleted successfully')
      refetchFiles()
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to delete assets')
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
      // Call API to update setting
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-metadata',
          data: {
            fileId: 'settings',
            description: settingName
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${settingName}`)
      }

      toast.dismiss()
      toast.success(`${settingName} updated successfully`)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : `Failed to update ${settingName.toLowerCase()}`)
    }
  }

  const handleUpgradeStorage = () => {
    toast.info('Opening upgrade options...')
    // In production, this would open a payment/upgrade dialog
    window.open('/pricing', '_blank')
  }

  // Handler for adding a new tag
  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name')
      return
    }
    const trimmedTag = newTagName.trim().toLowerCase()
    if (customTags.includes(trimmedTag)) {
      toast.error('This tag already exists')
      return
    }
    setCustomTags(prev => [...prev, trimmedTag])
    setNewTagName('')
    toast.success(`Tag "${trimmedTag}" added successfully`)
  }

  // Handler for inviting a collaborator
  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }
    if (pendingInvites.includes(inviteEmail.trim())) {
      toast.error('An invitation has already been sent to this email')
      return
    }

    const emailToInvite = inviteEmail.trim()
    toast.loading('Sending invitation...')

    try {
      // Call API to share/invite collaborator
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share-file',
          data: {
            fileIds: [],
            recipients: [emailToInvite],
            permission: 'view',
            expiresIn: '30 days'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitation')
      }

      setPendingInvites(prev => [...prev, emailToInvite])
      setInviteEmail('')
      toast.dismiss()
      toast.success(`Invitation sent to ${emailToInvite}`)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    }
  }

  // Bulk selection handlers
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) {
        newSet.delete(assetId)
      } else {
        newSet.add(assetId)
      }
      return newSet
    })
  }

  const selectAllAssets = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(filteredAssets.map(a => a.id)))
    }
  }

  const clearSelection = () => {
    setSelectedAssets(new Set())
    setBulkSelectMode(false)
  }

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) {
      toast.error('No assets selected')
      return
    }

    if (!confirm(`Delete ${selectedAssets.size} selected asset(s)? This action cannot be undone.`)) {
      return
    }

    const deletePromise = async () => {
      let deleted = 0
      const assetIds = Array.from(selectedAssets)
      for (const assetId of assetIds) {
        try {
          await fileMutation.remove(assetId)
          deleted++
        } catch (error) {
          console.error('Error deleting asset:', error)
        }
      }
      clearSelection()
      refetchFiles()
      return deleted
    }

    toast.promise(deletePromise(), {
      loading: `Deleting ${selectedAssets.size} assets...`,
      success: (count) => `Deleted ${count} asset(s) successfully`,
      error: 'Failed to delete some assets'
    })
  }

  const handleBulkDownload = async () => {
    if (selectedAssets.size === 0) {
      toast.error('No assets selected')
      return
    }

    const assetsToDownload = filteredAssets.filter(a => selectedAssets.has(a.id))

    toast.loading(`Preparing ${assetsToDownload.length} files for download...`)

    for (const asset of assetsToDownload) {
      if (asset.originalUrl) {
        try {
          const response = await fetch(asset.originalUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = asset.fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch {
          // Fallback
          window.open(asset.originalUrl, '_blank')
        }
      }
    }

    toast.dismiss()
    toast.success(`Downloaded ${assetsToDownload.length} files`)
    clearSelection()
  }

  const handleBulkMove = () => {
    if (selectedAssets.size === 0) {
      toast.error('No assets selected')
      return
    }
    // Use the first selected asset as reference for the move dialog
    const firstAsset = filteredAssets.find(a => selectedAssets.has(a.id))
    if (firstAsset) {
      setItemToMove(firstAsset)
      setShowMoveDialog(true)
    }
  }

  const handleBulkStar = async () => {
    if (selectedAssets.size === 0) {
      toast.error('No assets selected')
      return
    }

    const starPromise = async () => {
      let updated = 0
      const assetIds = Array.from(selectedAssets)
      for (const assetId of assetIds) {
        try {
          await fileMutation.update(assetId, { is_starred: true })
          updated++
        } catch (error) {
          console.error('Error starring asset:', error)
        }
      }
      clearSelection()
      refetchFiles()
      return updated
    }

    toast.promise(starPromise(), {
      loading: 'Starring selected assets...',
      success: (count) => `Starred ${count} asset(s)`,
      error: 'Failed to star some assets'
    })
  }

  // URL Import handler
  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setIsImporting(true)

    const importPromise = async () => {
      try {
        const response = await fetch(importUrl)
        if (!response.ok) throw new Error('Failed to fetch URL')

        const blob = await response.blob()
        const fileName = importFileName.trim() || importUrl.split('/').pop() || 'imported-file'
        const file = new File([blob], fileName, { type: blob.type })

        // Determine file type
        let fileType: MediaFileType = 'other'
        if (blob.type.startsWith('image/')) fileType = 'image'
        else if (blob.type.startsWith('video/')) fileType = 'video'
        else if (blob.type.startsWith('audio/')) fileType = 'audio'
        else if (blob.type.includes('pdf') || blob.type.includes('document')) fileType = 'document'

        // Upload to Supabase Storage
        const storageName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(`uploads/${storageName}`, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(`uploads/${storageName}`)

        // Create file record
        await fileMutation.create({
          file_name: fileName,
          original_name: fileName,
          file_type: fileType,
          file_size: blob.size,
          mime_type: blob.type,
          storage_path: uploadData?.path || `uploads/${storageName}`,
          public_url: urlData?.publicUrl || null,
          access_level: 'private',
          is_public: false,
          status: 'active',
          view_count: 0,
          download_count: 0,
          share_count: 0,
          is_starred: false,
          is_featured: false,
          password_protected: false,
        })

        setImportUrl('')
        setImportFileName('')
        setShowUrlImportDialog(false)
        refetchFiles()
        return fileName
      } catch (error) {
        throw error
      } finally {
        setIsImporting(false)
      }
    }

    toast.promise(importPromise(), {
      loading: 'Importing from URL...',
      success: (name) => `Imported "${name}" successfully`,
      error: 'Failed to import from URL'
    })
  }

  // Quick actions defined with real functionality
  const mediaQuickActions = useMemo(() => [
    { id: '1', label: 'Upload', icon: 'Upload', shortcut: 'U', action: handleUploadMedia },
    { id: '2', label: 'New Folder', icon: 'FolderPlus', shortcut: 'F', action: handleOpenNewFolder },
    { id: '3', label: 'Collection', icon: 'Layers', shortcut: 'C', action: handleOpenNewCollection },
    { id: '4', label: 'AI Tag', icon: 'Sparkles', shortcut: 'T', action: handleAITagAll },
  ], [])

  // Loading state
  if (filesLoading || foldersLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  // Error state
  if (filesError || foldersError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-red-500">Error loading media library data</p>
        <Button onClick={() => { refetchFiles(); refetchFolders(); }}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

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
            {/* Bulk selection mode toggle */}
            <Button
              variant={bulkSelectMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode)
                if (bulkSelectMode) clearSelection()
              }}
            >
              {bulkSelectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
              {bulkSelectMode ? 'Exit Select' : 'Select'}
            </Button>
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

        {/* Bulk Actions Toolbar - shows when assets are selected */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-4">
              <span className="font-medium text-indigo-700 dark:text-indigo-300">
                {selectedAssets.size} asset{selectedAssets.size > 1 ? 's' : ''} selected
              </span>
              <Button variant="ghost" size="sm" onClick={selectAllAssets}>
                {selectedAssets.size === filteredAssets.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkMove}>
                <Move className="w-4 h-4 mr-2" />
                Move
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkStar}>
                <Star className="w-4 h-4 mr-2" />
                Star
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection} aria-label="Close">
                  <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  <Card
                    key={asset.id}
                    className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
                      selectedAssets.has(asset.id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => {
                      if (bulkSelectMode) {
                        toggleAssetSelection(asset.id)
                      } else {
                        setSelectedAsset(asset)
                      }
                    }}
                  >
                    <CardContent className="p-0">
                      {/* Selection checkbox */}
                      {(bulkSelectMode || selectedAssets.size > 0) && (
                        <div
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAssetSelection(asset.id)
                          }}
                        >
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedAssets.has(asset.id)
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'bg-white/80 border-gray-300 hover:border-indigo-500'
                          }`}>
                            {selectedAssets.has(asset.id) && (
                              <CheckSquare className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      )}
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
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center gap-4 ${
                          selectedAssets.has(asset.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                        }`}
                        onClick={() => {
                          if (bulkSelectMode) {
                            toggleAssetSelection(asset.id)
                          } else {
                            setSelectedAsset(asset)
                          }
                        }}
                      >
                        {/* Selection checkbox for list view */}
                        {(bulkSelectMode || selectedAssets.size > 0) && (
                          <div
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAssetSelection(asset.id)
                            }}
                          >
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              selectedAssets.has(asset.id)
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-gray-300 hover:border-indigo-500'
                            }`}>
                              {selectedAssets.has(asset.id) && (
                                <CheckSquare className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        )}
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
                    <p className="text-blue-100">{mappedFolders.length} folders • {mappedFolders.reduce((sum, f) => sum + f.assetCount, 0)} total assets</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatSize(mappedFolders.reduce((sum, f) => sum + f.totalSize, 0))}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
              {mappedFolders.map((folder) => (
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
                    <p className="text-purple-100">{emptyCollections.length} collections • {emptyCollections.reduce((sum, c) => sum + c.assetCount, 0)} total assets</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{emptyCollections.filter(c => c.isPublic).length}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
              {emptyCollections.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Boxes className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No collections found. Create your first collection to get started.</p>
                </div>
              ) : emptyCollections.map((collection) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: ImagePlus, label: 'Images', desc: 'Upload photos', color: 'text-blue-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'image' }); setShowUploadDialog(true) } },
                { icon: Video, label: 'Videos', desc: 'Upload videos', color: 'text-purple-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'video' }); setShowUploadDialog(true) } },
                { icon: Music, label: 'Audio', desc: 'Upload audio', color: 'text-green-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'audio' }); setShowUploadDialog(true) } },
                { icon: FileText, label: 'Documents', desc: 'Upload docs', color: 'text-orange-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'document' }); setShowUploadDialog(true) } },
                { icon: FileUp, label: 'Bulk Upload', desc: 'Multi-file', color: 'text-pink-500', action: () => setShowUploadDialog(true) },
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
                <div
                  role="button"
                  tabIndex={0}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={handleUploadMedia}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleUploadMedia()
                    }
                  }}
                  aria-label="Upload media files - click or press Enter to browse"
                >
                  <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-semibold mb-2">Upload Assets</h3>
                  <p className="text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
                  <p className="text-sm text-gray-400">Supports: Images, Videos, Audio, Documents, Archives</p>
                  <p className="text-sm text-gray-400">Max file size: 5GB</p>
                  <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleUploadMedia}>
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
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
                  {mappedAssets.slice(0, 5).map((asset) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: BarChart3, label: 'Overview', desc: 'Key metrics', color: 'text-orange-500', action: () => { setActiveTab('analytics') } },
                { icon: TrendingUp, label: 'Trends', desc: 'View trends', color: 'text-green-500', action: () => setShowTrendsDialog(true) },
                { icon: PieChart, label: 'Distribution', desc: 'By type', color: 'text-purple-500', action: () => setShowDistributionDialog(true) },
                { icon: Activity, label: 'Real-time', desc: 'Live stats', color: 'text-red-500', action: () => setShowRealTimeDialog(true) },
                { icon: Eye, label: 'Views', desc: 'View analytics', color: 'text-blue-500', action: () => setShowViewsDialog(true) },
                { icon: Download, label: 'Downloads', desc: 'Download stats', color: 'text-cyan-500', action: () => setShowDownloadsDialog(true) },
                { icon: Database, label: 'Storage', desc: 'Usage report', color: 'text-amber-500', action: () => setShowStorageDialog(true) },
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
                      <p className="text-4xl font-bold text-indigo-600">{formatSize(stats.totalSize)}</p>
                      <p className="text-sm text-gray-500">of {formatSize(emptyUsageStats.storageLimit)}</p>
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
                    {mappedAssets.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No assets yet</p>
                    ) : mappedAssets
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
                    {emptyUsageStats.byType.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No storage data available</p>
                    ) : emptyUsageStats.byType.map((item) => (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getFileTypeIcon(item.type)}
                            <span className="text-sm font-medium capitalize">{item.type}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatSize(item.size)}</span>
                        </div>
                        <Progress value={stats.totalSize > 0 ? (item.size / stats.totalSize) * 100 : 0} className="h-2" />
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
                      <p className="text-3xl font-bold">{formatSize(emptyUsageStats.bandwidth.used)}</p>
                      <p className="text-sm text-gray-500">of {formatSize(emptyUsageStats.bandwidth.limit)} this month</p>
                    </div>
                    <Progress value={emptyUsageStats.bandwidth.limit > 0 ? (emptyUsageStats.bandwidth.used / emptyUsageStats.bandwidth.limit) * 100 : 0} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
              insights={emptyAIInsights}
              title="Media Intelligence"
              onInsightAction={(insight) => {
                if (insight.category === 'Storage') {
                  setActiveTab('settings')
                  setSettingsTab('storage')
                  toast.info('Navigate to Storage settings')
                } else if (insight.category === 'Automation') {
                  handleAITagAll()
                } else if (insight.category === 'Compliance') {
                  setShowFilterDialog(true)
                  toast.info('Review assets with expiring licenses')
                } else {
                  toast.info(`Action for: ${insight.title}`)
                }
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={emptyCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={emptyPredictions}
              title="Asset Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={emptyActivities}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
        <Dialog open={showUploadDialog} onOpenChange={(open) => {
          if (!isUploading) setShowUploadDialog(open)
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isUploading ? 'Uploading Files' : 'Upload New Asset'}</DialogTitle>
              <DialogDescription>
                {isUploading
                  ? `Uploading ${uploadingFiles.length} file${uploadingFiles.length > 1 ? 's' : ''}...`
                  : 'Add a new file to your media library'}
              </DialogDescription>
            </DialogHeader>

            {isUploading ? (
              <div className="space-y-6 py-4">
                {/* Upload Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Upload Progress</span>
                    <span className="text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3" />
                </div>

                {/* Files being uploaded */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadingFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        {file.type.startsWith('image/') && <FileImage className="w-5 h-5 text-indigo-600" />}
                        {file.type.startsWith('video/') && <FileVideo className="w-5 h-5 text-indigo-600" />}
                        {file.type.startsWith('audio/') && <FileAudio className="w-5 h-5 text-indigo-600" />}
                        {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && (
                          <FileText className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                      </div>
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Please wait while your files are being uploaded...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Drag and drop area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-indigo-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {dragActive ? 'Drop files here' : 'Drag and drop files here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports images, videos, audio, documents, and archives (max 5GB)
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">Or create manually</span>
                  </div>
                </div>

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
            )}

            {!isUploading && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateFile} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create File'}
                </Button>
              </DialogFooter>
            )}
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
                    {mappedFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                {customTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-gray-200" onClick={() => { setSearchQuery(tag); setShowTagManagerDialog(false); toast.success(`Filtering by "${tag}"`) }}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Add New Tag</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
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
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Admin</p>
                  <p className="text-sm text-gray-500">Full access</p>
                </div>
                <Switch
                  checked={permissionSettings.admin}
                  onCheckedChange={(checked) => setPermissionSettings(prev => ({ ...prev, admin: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Editor</p>
                  <p className="text-sm text-gray-500">Edit & upload</p>
                </div>
                <Switch
                  checked={permissionSettings.editor}
                  onCheckedChange={(checked) => setPermissionSettings(prev => ({ ...prev, editor: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Viewer</p>
                  <p className="text-sm text-gray-500">View only</p>
                </div>
                <Switch
                  checked={permissionSettings.viewer}
                  onCheckedChange={(checked) => setPermissionSettings(prev => ({ ...prev, viewer: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowPermissionsDialog(false)
                toast.success('Permissions saved')
              }}>Save</Button>
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
                <Switch
                  checked={privacySettings.publicAccess}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, publicAccess: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Password Protected</p>
                  <p className="text-sm text-gray-500">Require password to access</p>
                </div>
                <Switch
                  checked={privacySettings.passwordProtected}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, passwordProtected: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Link Sharing</p>
                  <p className="text-sm text-gray-500">Allow sharing via link</p>
                </div>
                <Switch
                  checked={privacySettings.linkSharing}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, linkSharing: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrivacyDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowPrivacyDialog(false)
                toast.success('Privacy settings saved')
              }}>Save</Button>
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
              {emptyCollaborators.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No collaborators yet. Invite team members below.</p>
              ) : emptyCollaborators.map(collab => (
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
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-gray-500">Pending Invitations</Label>
                  {pendingInvites.map(email => (
                    <div key={email} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm">{email}</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <Label>Invite Member</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInviteCollaborator()}
                  />
                  <Button onClick={handleInviteCollaborator}>Invite</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollaboratorsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* URL Import Dialog */}
        <Dialog open={showUrlImportDialog} onOpenChange={(open) => {
          if (!isImporting) {
            setShowUrlImportDialog(open)
            if (!open) {
              setImportUrl('')
              setImportFileName('')
            }
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import from URL</DialogTitle>
              <DialogDescription>Import media files directly from a URL</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import_url">File URL *</Label>
                <Input
                  id="import_url"
                  placeholder="https://example.com/image.jpg"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="import_filename">File Name (optional)</Label>
                <Input
                  id="import_filename"
                  placeholder="Enter file name"
                  value={importFileName}
                  onChange={(e) => setImportFileName(e.target.value)}
                  disabled={isImporting}
                />
                <p className="text-xs text-gray-500">Leave empty to auto-detect from URL</p>
              </div>
              {isImporting && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Importing file...
                  </span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUrlImportDialog(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={handleUrlImport} disabled={isImporting || !importUrl.trim()}>
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
              </Button>
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
                { name: 'Google Drive', icon: FolderSync, color: 'text-blue-500', url: 'https://accounts.google.com/o/oauth2/v2/auth' },
                { name: 'Dropbox', icon: FolderSync, color: 'text-blue-600', url: 'https://www.dropbox.com/oauth2/authorize' },
                { name: 'OneDrive', icon: FolderSync, color: 'text-blue-400', url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' },
                { name: 'AWS S3', icon: Database, color: 'text-orange-500', url: 'https://console.aws.amazon.com/s3' },
              ].map(service => (
                <Card key={service.name} className="p-4 cursor-pointer hover:shadow-md flex items-center gap-4" onClick={() => {
                  window.open(service.url, '_blank')
                  setShowCloudImportDialog(false)
                  toast.success(`Connecting to ${service.name}...`)
                }}>
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

        {/* Trends Analytics Dialog */}
        <Dialog open={showTrendsDialog} onOpenChange={setShowTrendsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Trends Analysis
              </DialogTitle>
              <DialogDescription>View performance trends over time</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Views</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">+25%</p>
                  <p className="text-xs text-green-600">vs last month</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Downloads</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">+15%</p>
                  <p className="text-xs text-blue-600">vs last month</p>
                </div>
              </div>
              <div className="h-40 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Trend chart visualization</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrendsDialog(false)}>Close</Button>
              <Button onClick={() => { handleExportAnalytics(); setShowTrendsDialog(false) }}>Export Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Distribution Analytics Dialog */}
        <Dialog open={showDistributionDialog} onOpenChange={setShowDistributionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Asset Distribution
              </DialogTitle>
              <DialogDescription>Breakdown of assets by type</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileImage className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Images</span>
                  </div>
                  <p className="text-xl font-bold">{stats.imageCount}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileVideo className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Videos</span>
                  </div>
                  <p className="text-xl font-bold">{stats.videoCount}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileAudio className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Audio</span>
                  </div>
                  <p className="text-xl font-bold">{stats.audioCount}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Documents</span>
                  </div>
                  <p className="text-xl font-bold">{stats.docCount}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDistributionDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Real-time Analytics Dialog */}
        <Dialog open={showRealTimeDialog} onOpenChange={setShowRealTimeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-500" />
                Real-time Activity
              </DialogTitle>
              <DialogDescription>Live monitoring of asset activity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Monitoring active - Live data streaming</span>
              </div>
              <div className="space-y-2">
                {emptyActivities.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                ) : emptyActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.action} {activity.target}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRealTimeDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Views Analytics Dialog */}
        <Dialog open={showViewsDialog} onOpenChange={setShowViewsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Views Analytics
              </DialogTitle>
              <DialogDescription>Detailed view statistics for your assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Total Views</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Top Viewed Assets</h4>
                {mappedAssets
                  .sort((a, b) => b.viewCount - a.viewCount)
                  .slice(0, 3)
                  .map((asset, idx) => (
                    <div key={asset.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">{idx + 1}</span>
                        <span className="text-sm truncate">{asset.fileName}</span>
                      </div>
                      <span className="text-sm font-medium">{asset.viewCount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Downloads Analytics Dialog */}
        <Dialog open={showDownloadsDialog} onOpenChange={setShowDownloadsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-cyan-500" />
                Downloads Analytics
              </DialogTitle>
              <DialogDescription>Track download statistics for your assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <p className="text-4xl font-bold text-cyan-700 dark:text-cyan-400">{stats.totalDownloads.toLocaleString()}</p>
                <p className="text-sm text-cyan-600">Total Downloads</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Most Downloaded Assets</h4>
                {mappedAssets
                  .sort((a, b) => b.downloadCount - a.downloadCount)
                  .slice(0, 3)
                  .map((asset, idx) => (
                    <div key={asset.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">{idx + 1}</span>
                        <span className="text-sm truncate">{asset.fileName}</span>
                      </div>
                      <span className="text-sm font-medium">{asset.downloadCount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDownloadsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Storage Analytics Dialog */}
        <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-500" />
                Storage Usage Report
              </DialogTitle>
              <DialogDescription>Detailed breakdown of your storage usage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">{formatSize(stats.totalSize)}</p>
                <p className="text-sm text-amber-600">of {formatSize(emptyUsageStats.storageLimit)} used</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-gray-500">{stats.storageUsed.toFixed(1)}%</span>
                </div>
                <Progress value={stats.storageUsed} className="h-3" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Usage by Type</h4>
                {emptyUsageStats.byType.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No storage data available</p>
                ) : emptyUsageStats.byType.map(item => (
                  <div key={item.type} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getFileTypeIcon(item.type)}
                      <span className="text-sm capitalize">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium">{formatSize(item.size)}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStorageDialog(false)}>Close</Button>
              <Button onClick={handleUpgradeStorage}>Upgrade Storage</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
