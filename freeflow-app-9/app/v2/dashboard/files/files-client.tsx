'use client'
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


import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Upload,
  Trash2,
  Search,
  Calendar,
  User,
  Share2,
  Eye,
  FolderOpen,
  Copy,
  Shield,
  Lock,
  DollarSign,
  FolderPlus,
  Edit,
  Move,
  MoreHorizontal,
  RefreshCw,
  Archive,
  Star,
  StarOff,
  AlertTriangle,
  Users,
  Link,
  Mail,
  CheckCircle,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA, File } from '@/lib/client-zone-utils'

// SECURE FILE DELIVERY INTEGRATION
import { SecureFileUpload } from '@/components/secure-files/secure-file-upload'
import { FileGallery } from '@/components/secure-files/file-gallery'
import { FileAccessDialog } from '@/components/secure-files/file-access-dialog'
import { EscrowReleaseDialog } from '@/components/secure-files/escrow-release-dialog'
import type { FileItem } from '@/components/secure-files/file-gallery'

const logger = createFeatureLogger('ClientZoneFiles')

// ============================================================================
// EXTENDED FILE DATA
// ============================================================================

interface ExtendedFile extends File {
  downloads?: number
  views?: number
  shared?: boolean
  sharedWith?: string[]
}

const EXTENDED_FILES: ExtendedFile[] = [
  {
    id: 1,
    name: 'Brand Guidelines Draft v3.pdf',
    size: '2.4 MB',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-25',
    project: 'Brand Identity Redesign',
    type: 'document',
    downloads: 3,
    views: 12,
    shared: true,
    sharedWith: ['John Smith', 'Michael Chen']
  },
  {
    id: 2,
    name: 'Logo Concepts Final.zip',
    size: '15.7 MB',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-20',
    project: 'Brand Identity Redesign',
    type: 'archive',
    downloads: 2,
    views: 8,
    shared: false,
    sharedWith: []
  },
  {
    id: 3,
    name: 'Website-Mockups.psd',
    size: '45.3 MB',
    uploadedBy: 'Alex Thompson',
    uploadDate: '2024-01-15',
    project: 'Website Development',
    type: 'document',
    downloads: 5,
    views: 15,
    shared: true,
    sharedWith: ['John Smith', 'Lisa Wang']
  },
  {
    id: 4,
    name: 'Brand-Color-Palette.ai',
    size: '8.2 MB',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-10',
    project: 'Brand Identity Redesign',
    type: 'document',
    downloads: 1,
    views: 5,
    shared: false,
    sharedWith: []
  },
  {
    id: 5,
    name: 'Final-Deliverables.zip',
    size: '124.8 MB',
    uploadedBy: 'Michael Chen',
    uploadDate: '2024-01-05',
    project: 'Website Development',
    type: 'archive',
    downloads: 0,
    views: 3,
    shared: false,
    sharedWith: []
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getFileIcon = (type: string) => {
  switch (type) {
    case 'document':
      return <FileText className="h-6 w-6 text-blue-600" />
    case 'archive':
      return <FolderOpen className="h-6 w-6 text-orange-600" />
    case 'image':
      return <FileText className="h-6 w-6 text-green-600" />
    case 'video':
      return <FileText className="h-6 w-6 text-purple-600" />
    default:
      return <FileText className="h-6 w-6 text-gray-600" />
  }
}

const getFileColor = (type: string) => {
  switch (type) {
    case 'document':
      return 'bg-blue-100'
    case 'archive':
      return 'bg-orange-100'
    case 'image':
      return 'bg-green-100'
    case 'video':
      return 'bg-purple-100'
    default:
      return 'bg-gray-100'
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Files Context
// ============================================================================

const filesAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const filesCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const filesPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const filesActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside component to access handlers
const getFilesQuickActions = (
  handleUploadFile: () => Promise<void>,
  handleExportFiles: () => Promise<void>,
  router: ReturnType<typeof useRouter>
) => [
  {
    id: '1',
    label: 'New Item',
    icon: 'Plus',
    shortcut: 'N',
    action: async () => {
      await handleUploadFile()
    }
  },
  {
    id: '2',
    label: 'Export',
    icon: 'Download',
    shortcut: 'E',
    action: async () => {
      await handleExportFiles()
    }
  },
  {
    id: '3',
    label: 'Settings',
    icon: 'Settings',
    shortcut: 'S',
    action: async () => {
      router.push('/v2/settings')
    }
  },
]

export default function FilesClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  // FILE STATE
  const [files, setFiles] = useState<ExtendedFile[]>(EXTENDED_FILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'archives' | 'images' | 'videos'>('all')
  const [selectedFile, setSelectedFile] = useState<ExtendedFile | null>(null)
  const [filteredFiles, setFilteredFiles] = useState<ExtendedFile[]>(EXTENDED_FILES)
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')

  // SECURE FILE DELIVERY STATE
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [showEscrowDialog, setShowEscrowDialog] = useState(false)
  const [selectedSecureFile, setSelectedSecureFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useState<'legacy' | 'secure'>('legacy')

  // DIALOG STATES
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)

  // FORM STATES
  const [newFolderName, setNewFolderName] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'admin'>('view')
  const [moveDestination, setMoveDestination] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // STARRED FILES
  const [starredFiles, setStarredFiles] = useState<number[]>([])

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load files from API
        const response = await fetch('/api/client-zone/files')
        if (!response.ok) throw new Error('Failed to load files')

        setIsLoading(false)
        announce('Files loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files')
        setIsLoading(false)
        announce('Error loading files', 'assertive')
      }
    }

    loadFiles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter and sort files
  useEffect(() => {
    let filtered = files.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.project.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType =
        filterType === 'all' ||
        (filterType === 'documents' && file.type === 'document') ||
        (filterType === 'archives' && file.type === 'archive') ||
        (filterType === 'images' && file.type === 'image') ||
        (filterType === 'videos' && file.type === 'video')

      return matchesSearch && matchesType
    })

    // Sort files
    if (sortBy === 'date') {
      filtered = filtered.sort((a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      )
    } else if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'size') {
      filtered = filtered.sort((a, b) => {
        const aSize = parseInt(a.size)
        const bSize = parseInt(b.size)
        return bSize - aSize
      })
    }

    setFilteredFiles(filtered)
  }, [searchQuery, filterType, files, sortBy])

  // ============================================================================
  // HANDLER 1: DOWNLOAD FILE - Real blob download
  // ============================================================================

  const handleDownloadFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {        // Real API call to get file blob
        const response = await fetch(`/api/files/${file.id}/download`, {
          method: 'GET',
          headers: {
            'Accept': 'application/octet-stream'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to download file')
        }

        // Get the blob from response
        const blob = await response.blob()

        // Create object URL for the blob
        const blobUrl = window.URL.createObjectURL(blob)

        // Create download link and trigger download
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = file.name
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)        // Update download count
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id
            ? { ...f, downloads: (f.downloads || 0) + 1 }
            : f
        ))

        return file.name
      })(),
      {
        loading: `Downloading ${file.name}...`,
        success: (name) => `${name} downloaded successfully`,
        error: (err) => err.message || 'Failed to download file'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 2: UPLOAD FILE - Real FormData POST to /api/files
  // ============================================================================

  const handleUploadFile = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '*/*'

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const uploadedFiles = target.files

      if (!uploadedFiles || uploadedFiles.length === 0) return

      setIsUploading(true)      for (const file of Array.from(uploadedFiles)) {
        toast.promise(
          (async () => {            // Create FormData for real file upload
            const formData = new FormData()
            formData.append('file', file)
            formData.append('fileName', file.name)
            formData.append('project', 'Recent Upload')

            // Real API call with FormData
            const response = await fetch('/api/files', {
              method: 'POST',
              body: formData
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || 'Failed to upload file')
            }

            const result = await response.json()            // Add file to list with response data
            const newFile: ExtendedFile = {
              id: result.id || Date.now(),
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedBy: KAZI_CLIENT_DATA.clientInfo.contactPerson,
              uploadDate: new Date().toISOString().split('T')[0],
              project: 'Recent Upload',
              type: file.type.includes('image') ? 'image' :
                    file.type.includes('video') ? 'video' :
                    file.name.endsWith('.zip') || file.name.endsWith('.rar') ? 'archive' : 'document',
              downloads: 0,
              views: 0,
              shared: false,
              sharedWith: []
            }

            setFiles(prevFiles => [newFile, ...prevFiles])
            return file.name
          })(),
          {
            loading: `Uploading ${file.name}...`,
            success: (name) => `${name} uploaded successfully`,
            error: (err) => `Failed to upload ${file.name}: ${err.message}`
          }
        )
      }

      setIsUploading(false)
    }

    input.click()
  }, [])

  // ============================================================================
  // HANDLER 3: DELETE FILE - confirm() + real DELETE request
  // ============================================================================

  const handleDeleteFile = useCallback(async (fileId: number, fileName: string) => {
    // Confirm deletion with user
    const confirmed = window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)

    if (!confirmed) {      return
    }

    toast.promise(
      (async () => {        // Real DELETE request to API
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to delete file')
        }        // Remove file from state
        setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
        setSelectedFile(null)

        return fileName
      })(),
      {
        loading: `Deleting ${fileName}...`,
        success: (name) => `${name} deleted successfully`,
        error: (err) => err.message || 'Failed to delete file'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 4: SHARE FILE - Web Share API or copy link fallback
  // ============================================================================

  const handleShareFile = useCallback(async (file: ExtendedFile) => {
    const shareUrl = `${window.location.origin}/files/${file.id}`    // Try Web Share API first (available on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: `Check out this file: ${file.name}`,
          url: shareUrl
        })        // Update shared status
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id ? { ...f, shared: true } : f
        ))

        toast.success('File shared successfully!')
        return
      } catch (shareError: any) {
        // User cancelled or share failed, fall back to clipboard
        if (shareError.name === 'AbortError') {          return
        }      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)

      // Update shared status
      setFiles(prevFiles => prevFiles.map(f =>
        f.id === file.id ? { ...f, shared: true } : f
      ))      toast.success('Share link copied!')
    } catch (clipboardError: any) {
      logger.error('Failed to copy share link', { error: clipboardError, fileId: file.id })
      toast.error('Failed to share file')
    }
  }, [])

  // ============================================================================
  // HANDLER 5: VIEW FILE - Real file preview
  // ============================================================================

  const handleViewFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {        // Fetch file preview URL from API
        const response = await fetch(`/api/files/${file.id}/preview`, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to load file preview')
        }

        const data = await response.json()

        // Update view count in state
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id
            ? { ...f, views: (f.views || 0) + 1 }
            : f
        ))

        // Open preview in new tab or modal
        if (data.previewUrl) {
          window.open(data.previewUrl, '_blank', 'noopener,noreferrer')
        } else {
          // Fallback: open file directly
          window.open(`/api/files/${file.id}/download`, '_blank', 'noopener,noreferrer')
        }        return file.name
      })(),
      {
        loading: `Loading preview for ${file.name}...`,
        success: (name) => `Opened preview for ${name}`,
        error: (err) => err.message || 'Failed to open file preview'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 6: COPY FILE LINK
  // ============================================================================

  const handleCopyLink = useCallback(async (file: ExtendedFile) => {
    try {
      const link = `${window.location.origin}/files/${file.id}/${encodeURIComponent(file.name)}`
      await navigator.clipboard.writeText(link)      toast.success('Link copied to clipboard!')
    } catch (error: any) {
      logger.error('Failed to copy link', { error })
      toast.error('Failed to copy link')
    }
  }, [])

  // ============================================================================
  // HANDLER 7: RENAME FILE - PUT to /api/files/{id}
  // ============================================================================

  const handleRenameFile = useCallback(async (file: ExtendedFile) => {
    const newName = window.prompt('Enter new file name:', file.name)

    if (!newName || newName === file.name) {
      return
    }

    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${file.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to rename file')
        }        // Update file in state
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id ? { ...f, name: newName } : f
        ))

        // Update selected file if it's the renamed one
        if (selectedFile?.id === file.id) {
          setSelectedFile(prev => prev ? { ...prev, name: newName } : null)
        }

        return { oldName: file.name, newName }
      })(),
      {
        loading: `Renaming ${file.name}...`,
        success: (data) => `Renamed "${data.oldName}" to "${data.newName}"`,
        error: (err) => err.message || 'Failed to rename file'
      }
    )
  }, [selectedFile])

  // ============================================================================
  // HANDLER 8: MOVE FILE - PUT to /api/files/{id}/move
  // ============================================================================

  const handleMoveFile = useCallback(async (file: ExtendedFile) => {
    const newProject = window.prompt('Enter destination project/folder:', file.project)

    if (!newProject || newProject === file.project) {
      return
    }

    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${file.id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: newProject })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to move file')
        }        // Update file in state
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id ? { ...f, project: newProject } : f
        ))

        // Update selected file if it's the moved one
        if (selectedFile?.id === file.id) {
          setSelectedFile(prev => prev ? { ...prev, project: newProject } : null)
        }

        return { fileName: file.name, destination: newProject }
      })(),
      {
        loading: `Moving ${file.name}...`,
        success: (data) => `Moved "${data.fileName}" to "${data.destination}"`,
        error: (err) => err.message || 'Failed to move file'
      }
    )
  }, [selectedFile])

  // ============================================================================
  // HANDLER 9: EXPORT FILES - Bulk export selected files
  // ============================================================================

  const handleExportFiles = useCallback(async () => {
    toast.promise(
      (async () => {        // Request bulk export from API
        const response = await fetch('/api/files/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileIds: filteredFiles.map(f => f.id)
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to export files')
        }

        // Get the export blob (zip file)
        const blob = await response.blob()

        // Create download link
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `files-export-${new Date().toISOString().split('T')[0]}.zip`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)        return filteredFiles.length
      })(),
      {
        loading: `Exporting ${filteredFiles.length} files...`,
        success: (count) => `Successfully exported ${count} files`,
        error: (err) => err.message || 'Failed to export files'
      }
    )
  }, [filteredFiles])

  // Create quick actions with real handlers
  const filesQuickActions = getFilesQuickActions(handleUploadFile, handleExportFiles, router)

  // ============================================================================
  // SECURE FILE DELIVERY HANDLERS
  // ============================================================================

  const handleSecureFileClick = useCallback((file: FileItem) => {
    setSelectedSecureFile(file)

    // If file requires payment or password, show access dialog
    if (file.requiresPayment || file.accessType === 'password') {
      setShowAccessDialog(true)
    } else {
      // Direct download for public files
      handleSecureFileDownload(file)
    }
  }, [])

  const handleSecureFileDownload = useCallback(async (file: FileItem) => {
    try {      const response = await fetch(`/api/files/delivery/${file.id}/download`)
      const data = await response.json()

      if (data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl
        toast.success('Download started!')
      } else {
        throw new Error(data.error || 'Download failed')
      }
    } catch (error: any) {
      logger.error('Failed to download secure file', { error, fileName: file.fileName })
      toast.error('Failed to download file')
    }
  }, [])

  const handleEscrowRelease = useCallback((deliveryId: string) => {
    setSelectedSecureFile({ id: deliveryId } as FileItem)
    setShowEscrowDialog(true)
  }, [])

  const handleUploadComplete = useCallback(() => {
    setShowUploadDialog(false)
    toast.success('File uploaded successfully!')
    // Refresh secure files list
    window.location.reload()
  }, [])

  // ============================================================================
  // HANDLER 10: CREATE FOLDER - POST to /api/folders
  // ============================================================================

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }

    setActionLoading(true)
    toast.promise(
      (async () => {        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newFolderName,
            parentId: null
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to create folder')
        }

        const result = await response.json()        setShowCreateFolderDialog(false)
        setNewFolderName('')
        return newFolderName
      })(),
      {
        loading: `Creating folder "${newFolderName}"...`,
        success: (name) => `Folder "${name}" created successfully`,
        error: (err) => err.message || 'Failed to create folder'
      }
    ).finally(() => setActionLoading(false))
  }, [newFolderName])

  // ============================================================================
  // HANDLER 11: RENAME FILE (DIALOG VERSION) - PUT to /api/files/{id}
  // ============================================================================

  const handleOpenRenameDialog = useCallback((file: ExtendedFile) => {
    setSelectedFile(file)
    setRenameValue(file.name)
    setShowRenameDialog(true)
  }, [])

  const handleSubmitRename = useCallback(async () => {
    if (!selectedFile || !renameValue.trim() || renameValue === selectedFile.name) {
      if (!renameValue.trim()) toast.error('Please enter a file name')
      return
    }

    setActionLoading(true)
    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${selectedFile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: renameValue })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to rename file')
        }        // Update file in state
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === selectedFile.id ? { ...f, name: renameValue } : f
        ))

        setShowRenameDialog(false)
        setRenameValue('')
        return { oldName: selectedFile.name, newName: renameValue }
      })(),
      {
        loading: `Renaming "${selectedFile.name}"...`,
        success: (data) => `Renamed "${data.oldName}" to "${data.newName}"`,
        error: (err) => err.message || 'Failed to rename file'
      }
    ).finally(() => setActionLoading(false))
  }, [selectedFile, renameValue])

  // ============================================================================
  // HANDLER 12: DELETE FILE (DIALOG VERSION) - DELETE to /api/files/{id}
  // ============================================================================

  const handleOpenDeleteDialog = useCallback((file: ExtendedFile) => {
    setSelectedFile(file)
    setShowDeleteDialog(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedFile) return

    setActionLoading(true)
    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${selectedFile.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to delete file')
        }        // Remove file from state
        setFiles(prevFiles => prevFiles.filter(f => f.id !== selectedFile.id))
        setShowDeleteDialog(false)
        setSelectedFile(null)

        return selectedFile.name
      })(),
      {
        loading: `Deleting "${selectedFile.name}"...`,
        success: (name) => `"${name}" deleted successfully`,
        error: (err) => err.message || 'Failed to delete file'
      }
    ).finally(() => setActionLoading(false))
  }, [selectedFile])

  // ============================================================================
  // HANDLER 13: SHARE FILE (DIALOG VERSION) - POST to /api/files/{id}/share
  // ============================================================================

  const handleOpenShareDialog = useCallback((file: ExtendedFile) => {
    setSelectedFile(file)
    setShareEmail('')
    setSharePermission('view')
    setShowShareDialog(true)
  }, [])

  const handleSubmitShare = useCallback(async () => {
    if (!selectedFile) return

    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shareEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setActionLoading(true)
    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${selectedFile.id}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: shareEmail,
            permission: sharePermission
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to share file')
        }        // Update shared status and sharedWith
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === selectedFile.id
            ? {
                ...f,
                shared: true,
                sharedWith: [...(f.sharedWith || []), shareEmail]
              }
            : f
        ))

        setShowShareDialog(false)
        setShareEmail('')
        setSharePermission('view')
        return { fileName: selectedFile.name, email: shareEmail }
      })(),
      {
        loading: `Sharing "${selectedFile.name}" with ${shareEmail}...`,
        success: (data) => `"${data.fileName}" shared with ${data.email}`,
        error: (err) => err.message || 'Failed to share file'
      }
    ).finally(() => setActionLoading(false))
  }, [selectedFile, shareEmail, sharePermission])

  // ============================================================================
  // HANDLER 14: MOVE FILE (DIALOG VERSION) - PUT to /api/files/{id}/move
  // ============================================================================

  const handleOpenMoveDialog = useCallback((file: ExtendedFile) => {
    setSelectedFile(file)
    setMoveDestination(file.project)
    setShowMoveDialog(true)
  }, [])

  const handleSubmitMove = useCallback(async () => {
    if (!selectedFile || !moveDestination.trim() || moveDestination === selectedFile.project) {
      if (!moveDestination.trim()) toast.error('Please select a destination')
      return
    }

    setActionLoading(true)
    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${selectedFile.id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: moveDestination })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to move file')
        }        // Update file in state
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === selectedFile.id ? { ...f, project: moveDestination } : f
        ))

        setShowMoveDialog(false)
        setMoveDestination('')
        return { fileName: selectedFile.name, destination: moveDestination }
      })(),
      {
        loading: `Moving "${selectedFile.name}"...`,
        success: (data) => `Moved "${data.fileName}" to "${data.destination}"`,
        error: (err) => err.message || 'Failed to move file'
      }
    ).finally(() => setActionLoading(false))
  }, [selectedFile, moveDestination])

  // ============================================================================
  // HANDLER 15: TOGGLE STAR FILE
  // ============================================================================

  const handleToggleStar = useCallback(async (file: ExtendedFile) => {
    const isStarred = starredFiles.includes(file.id)

    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${file.id}/star`, {
          method: isStarred ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to ${isStarred ? 'unstar' : 'star'} file`)
        }

        // Update starred files
        if (isStarred) {
          setStarredFiles(prev => prev.filter(id => id !== file.id))
        } else {
          setStarredFiles(prev => [...prev, file.id])
        }

        return { fileName: file.name, starred: !isStarred }
      })(),
      {
        loading: `${isStarred ? 'Removing from' : 'Adding to'} favorites...`,
        success: (data) => data.starred ? `"${data.fileName}" added to favorites` : `"${data.fileName}" removed from favorites`,
        error: (err) => err.message
      }
    )
  }, [starredFiles])

  // ============================================================================
  // HANDLER 16: ARCHIVE FILE
  // ============================================================================

  const handleArchiveFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${file.id}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to archive file')
        }        // Remove from active list (archived files typically go to a separate view)
        setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id))
        setSelectedFile(null)

        return file.name
      })(),
      {
        loading: `Archiving "${file.name}"...`,
        success: (name) => `"${name}" archived successfully`,
        error: (err) => err.message || 'Failed to archive file'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 17: DUPLICATE FILE
  // ============================================================================

  const handleDuplicateFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {        const response = await fetch(`/api/files/${file.id}/duplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to duplicate file')
        }

        const result = await response.json()        // Add duplicated file to list
        const duplicatedFile: ExtendedFile = {
          ...file,
          id: result.id || Date.now(),
          name: `${file.name.replace(/(\.[^.]+)$/, '')} (copy)${file.name.match(/\.[^.]+$/)?.[0] || ''}`,
          uploadDate: new Date().toISOString().split('T')[0],
          downloads: 0,
          views: 0,
          shared: false,
          sharedWith: []
        }

        setFiles(prevFiles => [duplicatedFile, ...prevFiles])
        return file.name
      })(),
      {
        loading: `Duplicating "${file.name}"...`,
        success: (name) => `"${name}" duplicated successfully`,
        error: (err) => err.message || 'Failed to duplicate file'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 18: REFRESH FILES LIST
  // ============================================================================

  const handleRefreshFiles = useCallback(async () => {
    setIsLoading(true)
    toast.promise(
      (async () => {        const response = await fetch('/api/files', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to refresh files')
        }

        const result = await response.json()

        if (result.files) {
          setFiles(result.files)
        }        return result.files?.length || 0
      })(),
      {
        loading: 'Refreshing files...',
        success: (count) => `Loaded ${count} files`,
        error: (err) => err.message || 'Failed to refresh files'
      }
    ).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={filesAIInsights} />
          <PredictiveAnalytics predictions={filesPredictions} />
          <CollaborationIndicator collaborators={filesCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={filesQuickActions} />
          <ActivityFeed activities={filesActivities} />
        </div>
<CardSkeleton />
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Project Files
            </h1>
            <p className="text-gray-600 mt-2">
              Download, upload, and manage your project files
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
              <Button
                size="sm"
                variant={viewMode === 'legacy' ? 'default' : 'ghost'}
                onClick={() => setViewMode('legacy')}
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Legacy
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'secure' ? 'default' : 'ghost'}
                onClick={() => setViewMode('secure')}
              >
                <Shield className="h-4 w-4 mr-1" />
                Secure
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshFiles}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Create Folder Button */}
            <Button
              variant="outline"
              onClick={() => setShowCreateFolderDialog(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>

            {/* Upload Button */}
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={viewMode === 'secure' ? () => setShowUploadDialog(true) : handleUploadFile}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>

        {/* Secure File Delivery View */}
        {viewMode === 'secure' && (
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle>Secure File Delivery</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Password Protected
                    <DollarSign className="h-4 w-4 ml-2" />
                    Escrow Enabled
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FileGallery
                  onFileClick={handleSecureFileClick}
                  showPricing={true}
                  allowDownload={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legacy Files View */}
        {viewMode === 'legacy' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Files List */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>Files</CardTitle>
                      <Badge variant="outline">{filteredFiles.length}</Badge>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'documents', 'archives', 'images', 'videos'] as const).map((type) => (
                        <Button
                          key={type}
                          size="sm"
                          variant={filterType === type ? 'default' : 'outline'}
                          onClick={() => setFilterType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-600">Sort by:</span>
                      {(['date', 'name', 'size'] as const).map((sort) => (
                        <Button
                          key={sort}
                          size="sm"
                          variant={sortBy === sort ? 'default' : 'outline'}
                          onClick={() => setSortBy(sort)}
                        >
                          {sort.charAt(0).toUpperCase() + sort.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {filteredFiles.length === 0 ? (
                  <NoDataEmptyState
                    title="No files found"
                    description="Upload files or adjust your search filters"
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-blue-200 cursor-pointer"
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getFileColor(file.type)}`}>
                            {getFileIcon(file.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-semibold text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {file.size}
                                </p>
                              </div>
                              {file.shared && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  Shared
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {file.uploadedBy}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(file.uploadDate).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>{file.views || 0} views</span>
                              <span>{file.downloads || 0} downloads</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Star Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStar(file)
                              }}
                              title={starredFiles.includes(file.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {starredFiles.includes(file.id) ? (
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <Star className="h-3 w-3" />
                              )}
                            </Button>

                            {/* Download Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadFile(file)
                              }}
                              title="Download file"
                            >
                              <Download className="h-3 w-3" />
                            </Button>

                            {/* View Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewFile(file)
                              }}
                              title="Preview file"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            {/* More Actions Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" variant="ghost" title="More actions">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenShareDialog(file)
                                }}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyLink(file)
                                }}>
                                  <Link className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenRenameDialog(file)
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenMoveDialog(file)
                                }}>
                                  <Move className="h-4 w-4 mr-2" />
                                  Move
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleDuplicateFile(file)
                                }}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleArchiveFile(file)
                                }}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenDeleteDialog(file)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* File Details Sidebar */}
          <div className="space-y-4">
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">File Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-6 rounded-lg ${getFileColor(selectedFile.type)}`}>
                        {getFileIcon(selectedFile.type)}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="text-sm font-semibold text-gray-900 break-words">
                        {selectedFile.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Size</p>
                        <p className="text-sm font-semibold">{selectedFile.size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <Badge variant="outline" className="text-xs">
                          {selectedFile.type}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Uploaded By</p>
                      <p className="text-sm">{selectedFile.uploadedBy}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                      <p className="text-sm">
                        {new Date(selectedFile.uploadDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Project</p>
                      <Badge variant="secondary">{selectedFile.project}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 py-3 border-y">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedFile.views || 0}
                        </p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedFile.downloads || 0}
                        </p>
                        <p className="text-xs text-gray-500">Downloads</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Primary Actions */}
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => handleDownloadFile(selectedFile)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewFile(selectedFile)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenShareDialog(selectedFile)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(selectedFile)}
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRenameDialog(selectedFile)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Rename
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMoveDialog(selectedFile)}
                        >
                          <Move className="h-4 w-4 mr-1" />
                          Move
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateFile(selectedFile)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStar(selectedFile)}
                        >
                          {starredFiles.includes(selectedFile.id) ? (
                            <>
                              <StarOff className="h-4 w-4 mr-1" />
                              Unstar
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-1" />
                              Star
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Danger Zone */}
                      <div className="pt-2 border-t space-y-2">
                        <Button
                          variant="outline"
                          className="w-full text-orange-600 hover:text-orange-700 hover:border-orange-300"
                          onClick={() => handleArchiveFile(selectedFile)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleOpenDeleteDialog(selectedFile)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Storage Stats */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Files</span>
                    <span className="font-semibold">{files.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Size</span>
                    <span className="font-semibold">
                      {(
                        files.reduce(
                          (sum, f) => sum + parseInt(f.size),
                          0
                        ) / 1024
                      ).toFixed(1)}{' '}
                      MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="font-semibold">
                      {files.reduce((sum, f) => sum + (f.views || 0), 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Secure File Delivery Dialogs */}
        {showUploadDialog && (
          <SecureFileUpload
            open={showUploadDialog}
            onOpenChange={setShowUploadDialog}
            onSuccess={handleUploadComplete}
          />
        )}

        {selectedSecureFile && showAccessDialog && (
          <FileAccessDialog
            deliveryId={selectedSecureFile.id}
            open={showAccessDialog}
            onOpenChange={setShowAccessDialog}
            onDownloaded={() => {
              setShowAccessDialog(false)
              toast.success('File downloaded successfully!')
            }}
          />
        )}

        {selectedSecureFile && showEscrowDialog && (
          <EscrowReleaseDialog
            deliveryId={selectedSecureFile.id}
            open={showEscrowDialog}
            onOpenChange={setShowEscrowDialog}
            onReleased={() => {
              setShowEscrowDialog(false)
              toast.success('Escrow released successfully!')
              // Refresh files list
              window.location.reload()
            }}
          />
        )}

        {/* ================================================================ */}
        {/* CREATE FOLDER DIALOG */}
        {/* ================================================================ */}
        <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-blue-600" />
                Create New Folder
              </DialogTitle>
              <DialogDescription>
                Enter a name for your new folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  placeholder="Enter folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !actionLoading) {
                      handleCreateFolder()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateFolderDialog(false)
                  setNewFolderName('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={actionLoading || !newFolderName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Folder
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================ */}
        {/* RENAME FILE DIALOG */}
        {/* ================================================================ */}
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Rename File
              </DialogTitle>
              <DialogDescription>
                Enter a new name for "{selectedFile?.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  placeholder="Enter new file name..."
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !actionLoading) {
                      handleSubmitRename()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRenameDialog(false)
                  setRenameValue('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRename}
                disabled={actionLoading || !renameValue.trim() || renameValue === selectedFile?.name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Renaming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Rename
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================ */}
        {/* DELETE FILE DIALOG */}
        {/* ================================================================ */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete File
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedFile?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">{selectedFile?.name}</p>
                    <p className="text-sm text-red-600 mt-1">
                      Size: {selectedFile?.size} | Type: {selectedFile?.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete File
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================ */}
        {/* SHARE FILE DIALOG */}
        {/* ================================================================ */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                Share File
              </DialogTitle>
              <DialogDescription>
                Share "{selectedFile?.name}" with others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shareEmail">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Input
                    id="shareEmail"
                    type="email"
                    placeholder="Enter email address..."
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission">Permission Level</Label>
                <Select
                  value={sharePermission}
                  onValueChange={(value: 'view' | 'edit' | 'admin') => setSharePermission(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Only
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Can Edit
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Full Access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Shares */}
              {selectedFile?.sharedWith && selectedFile.sharedWith.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Currently Shared With</Label>
                  <div className="space-y-2">
                    {selectedFile.sharedWith.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{email}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">Shared</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Link Section */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (selectedFile) {
                      handleCopyLink(selectedFile)
                    }
                  }}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copy Shareable Link
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false)
                  setShareEmail('')
                  setSharePermission('view')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitShare}
                disabled={actionLoading || !shareEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================ */}
        {/* MOVE FILE DIALOG */}
        {/* ================================================================ */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Move className="h-5 w-5 text-blue-600" />
                Move File
              </DialogTitle>
              <DialogDescription>
                Move "{selectedFile?.name}" to a different project or folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Location</Label>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{selectedFile?.project}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Select
                  value={moveDestination}
                  onValueChange={setMoveDestination}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brand Identity Redesign">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Brand Identity Redesign
                      </div>
                    </SelectItem>
                    <SelectItem value="Website Development">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Website Development
                      </div>
                    </SelectItem>
                    <SelectItem value="Mobile App">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Mobile App
                      </div>
                    </SelectItem>
                    <SelectItem value="Marketing Materials">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Marketing Materials
                      </div>
                    </SelectItem>
                    <SelectItem value="Recent Upload">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Recent Upload
                      </div>
                    </SelectItem>
                    <SelectItem value="Archive">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Archive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoveDialog(false)
                  setMoveDestination('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitMove}
                disabled={actionLoading || !moveDestination.trim() || moveDestination === selectedFile?.project}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Moving...
                  </>
                ) : (
                  <>
                    <Move className="h-4 w-4 mr-2" />
                    Move File
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
