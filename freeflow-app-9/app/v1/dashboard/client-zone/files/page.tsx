// MIGRATED: Batch #28 - Removed mock data, using database hooks
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  RefreshCw
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA, File } from '@/lib/client-zone-utils'

// SECURE FILE DELIVERY INTEGRATION
import { SecureFileUpload } from '@/components/secure-files/secure-file-upload'
import { FileGallery } from '@/components/secure-files/file-gallery'
import { FileAccessDialog } from '@/components/secure-files/file-access-dialog'
import { EscrowReleaseDialog } from '@/components/secure-files/escrow-release-dialog'
import type { FileItem } from '@/components/secure-files/file-gallery'

const logger = createSimpleLogger('ClientZoneFiles')

// ============================================================================
// EXTENDED FILE DATA
// ============================================================================

interface ExtendedFile extends File {
  downloads?: number
  views?: number
  shared?: boolean
  sharedWith?: string[]
}

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

export default function FilesPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  // FILE STATE
  const [files, setFiles] = useState<ExtendedFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'archives' | 'images' | 'videos'>('all')
  const [selectedFile, setSelectedFile] = useState<ExtendedFile | null>(null)
  const [filteredFiles, setFilteredFiles] = useState<ExtendedFile[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')

  // SECURE FILE DELIVERY STATE
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [showEscrowDialog, setShowEscrowDialog] = useState(false)
  const [selectedSecureFile, setSelectedSecureFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useState<'legacy' | 'secure'>('legacy')

  // A+++ LOAD FILE DATA - Real API call to fetch files
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load files from API
        const response = await fetch('/api/files', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to load files')
        }

        const result = await response.json()

        if (result.files || result.items) {
          // Map API response to ExtendedFile format
          const apiFiles = result.files || result.items || []
          const mappedFiles: ExtendedFile[] = apiFiles.map((f: Record<string, unknown>) => ({
            id: f.id as number,
            name: (f.original_name || f.name) as string,
            size: typeof f.size === 'number' ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : (f.size as string || '0 MB'),
            uploadedBy: (f.uploaded_by || 'You') as string,
            uploadDate: f.created_at
              ? new Date(f.created_at as string).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            project: (f.folder_name || f.folder_id || 'Recent Upload') as string,
            type: (f.mime_type as string)?.startsWith('image/') ? 'image'
              : (f.mime_type as string)?.startsWith('video/') ? 'video'
              : (f.name as string)?.match(/\.(zip|rar|7z)$/i) ? 'archive'
              : 'document',
            downloads: (f.download_count as number) || 0,
            views: (f.view_count as number) || 0,
            shared: (f.is_public as boolean) || false,
            sharedWith: []
          }))
          setFiles(mappedFiles)
        }

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
  // HANDLER 1: DOWNLOAD FILE - Real blob download using URL.createObjectURL
  // ============================================================================

  const handleDownloadFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {
        logger.info('File download initiated', {
          fileName: file.name,
          fileSize: file.size,
          project: file.project
        })

        // Real API call to get file blob
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
        window.URL.revokeObjectURL(blobUrl)

        logger.info('File download completed', { fileName: file.name })

        // Update download count
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

      setIsUploading(true)

      for (const file of Array.from(uploadedFiles)) {
        toast.promise(
          (async () => {
            logger.info('Uploading file', {
              fileName: file.name,
              fileSize: file.size
            })

            // Create FormData for real file upload
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

            const result = await response.json()

            // Determine file type from MIME type
            const getFileType = (mimeType: string, fileName: string): string => {
              if (mimeType.startsWith('image/')) return 'image'
              if (mimeType.startsWith('video/')) return 'video'
              if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return 'archive'
              return 'document'
            }

            // Add file to list with response data
            const newFile: ExtendedFile = {
              id: result.id || Date.now(),
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedBy: KAZI_CLIENT_DATA.clientInfo.contactPerson,
              uploadDate: new Date().toISOString().split('T')[0],
              project: 'Recent Upload',
              type: getFileType(file.type, file.name),
              downloads: 0,
              views: 0,
              shared: false,
              sharedWith: []
            }

            setFiles(prevFiles => [newFile, ...prevFiles])
            logger.info('File uploaded successfully', { fileName: file.name })
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

    if (!confirmed) {
      return
    }

    toast.promise(
      (async () => {
        logger.info('File deletion initiated', { fileId, fileName })

        // Real DELETE request to API
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to delete file')
        }

        // Remove file from state
        setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
        setSelectedFile(null)

        logger.info('File deleted successfully', { fileId, fileName })
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
  // HANDLER 4: SHARE FILE - Web Share API or clipboard fallback with real share link
  // ============================================================================

  const handleShareFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {
        logger.info('File share initiated', { fileId: file.id, fileName: file.name })

        // Generate share link via API (creates share token)
        const response = await fetch(`/api/files/${file.id}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permission: 'view',
            expires_in_hours: 168 // 7 days
          })
        })

        let shareUrl: string

        if (response.ok) {
          const shareData = await response.json()
          shareUrl = shareData.share_url || `${window.location.origin}/files/share/${shareData.share_token}`
        } else {
          // Fallback to direct file URL
          shareUrl = `${window.location.origin}/files/${file.id}`
        }

        // Try Web Share API first (available on mobile and some desktop browsers)
        if (navigator.share) {
          try {
            await navigator.share({
              title: file.name,
              text: `Check out this file: ${file.name}`,
              url: shareUrl
            })

            // Update shared status
            setFiles(prevFiles => prevFiles.map(f =>
              f.id === file.id ? { ...f, shared: true } : f
            ))

            logger.info('File shared via Web Share API', { fileId: file.id })
            return { method: 'share', fileName: file.name }
          } catch (shareError: unknown) {
            // User cancelled or share failed, fall back to clipboard
            if ((shareError as Error).name === 'AbortError') {
              throw new Error('Share cancelled')
            }
          }
        }

        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareUrl)

        // Update shared status
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id ? { ...f, shared: true } : f
        ))

        logger.info('Share link copied to clipboard', { fileId: file.id })
        return { method: 'clipboard', fileName: file.name }
      })(),
      {
        loading: `Creating share link for ${file.name}...`,
        success: (data) => data.method === 'share'
          ? `${data.fileName} shared successfully!`
          : `Share link copied to clipboard!`,
        error: (err) => err.message || 'Failed to share file'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 5: VIEW FILE - Real file preview using blob URL
  // ============================================================================

  const handleViewFile = useCallback(async (file: ExtendedFile) => {
    toast.promise(
      (async () => {
        logger.info('File preview initiated', { fileId: file.id, fileName: file.name })

        // Fetch file preview URL from API
        const response = await fetch(`/api/files/${file.id}/preview`, {
          method: 'GET'
        })

        if (!response.ok) {
          // Fallback: try to get file blob directly for preview
          const downloadResponse = await fetch(`/api/files/${file.id}/download`, {
            method: 'GET',
            headers: { 'Accept': 'application/octet-stream' }
          })

          if (!downloadResponse.ok) {
            throw new Error('Failed to load file preview')
          }

          const blob = await downloadResponse.blob()
          const blobUrl = window.URL.createObjectURL(blob)

          // Open preview in new tab
          window.open(blobUrl, '_blank', 'noopener,noreferrer')

          // Cleanup after a delay (to allow download to start)
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000)
        } else {
          const data = await response.json()

          // Open preview in new tab or modal
          if (data.previewUrl) {
            window.open(data.previewUrl, '_blank', 'noopener,noreferrer')
          }
        }

        // Update view count in state
        setFiles(prevFiles => prevFiles.map(f =>
          f.id === file.id
            ? { ...f, views: (f.views || 0) + 1 }
            : f
        ))

        logger.info('File preview opened', { fileId: file.id })
        return file.name
      })(),
      {
        loading: `Loading preview for ${file.name}...`,
        success: (name) => `Opened preview for ${name}`,
        error: (err) => err.message || 'Failed to open file preview'
      }
    )
  }, [])

  // ============================================================================
  // HANDLER 6: COPY FILE LINK - Uses real origin and encodes filename
  // ============================================================================

  const handleCopyLink = useCallback(async (file: ExtendedFile) => {
    try {
      const link = `${window.location.origin}/files/${file.id}/${encodeURIComponent(file.name)}`
      await navigator.clipboard.writeText(link)
      logger.info('File link copied', { fileId: file.id })
      toast.success('Link copied to clipboard!')
    } catch (error) {
      logger.error('Failed to copy link', { error })
      toast.error('Failed to copy link')
    }
  }, [])

  // ============================================================================
  // HANDLER 7: EXPORT FILES - Generate CSV report of all files
  // ============================================================================

  const handleExportFiles = useCallback(async () => {
    toast.promise(
      (async () => {
        logger.info('File export initiated', { fileCount: filteredFiles.length })

        // Generate CSV content from current file list
        const csvHeaders = ['Name', 'Size', 'Type', 'Uploaded By', 'Upload Date', 'Project', 'Downloads', 'Views', 'Shared']
        const csvRows = filteredFiles.map(file => [
          file.name,
          file.size,
          file.type,
          file.uploadedBy,
          file.uploadDate,
          file.project,
          file.downloads || 0,
          file.views || 0,
          file.shared ? 'Yes' : 'No'
        ])

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell =>
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell}"`
              : cell
          ).join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `files-export-${new Date().toISOString().split('T')[0]}.csv`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)

        logger.info('File export completed', { fileCount: filteredFiles.length })
        return filteredFiles.length
      })(),
      {
        loading: `Exporting ${filteredFiles.length} files...`,
        success: (count) => `Successfully exported ${count} files`,
        error: (err) => err.message || 'Failed to export files'
      }
    )
  }, [filteredFiles])

  // ============================================================================
  // HANDLER 8: REFRESH FILES - Reload file list from API
  // ============================================================================

  const handleRefreshFiles = useCallback(async () => {
    setIsLoading(true)
    toast.promise(
      (async () => {
        const response = await fetch('/api/files', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to refresh files')
        }

        const result = await response.json()

        if (result.files) {
          // Map API response to ExtendedFile format
          const mappedFiles: ExtendedFile[] = result.files.map((f: Record<string, unknown>) => ({
            id: f.id,
            name: f.original_name || f.name,
            size: typeof f.size === 'number' ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : f.size,
            uploadedBy: f.uploaded_by || 'You',
            uploadDate: f.created_at ? new Date(f.created_at as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            project: f.folder_name || 'Recent Upload',
            type: (f.mime_type as string)?.startsWith('image/') ? 'image'
              : (f.mime_type as string)?.startsWith('video/') ? 'video'
              : (f.name as string)?.match(/\.(zip|rar|7z)$/i) ? 'archive'
              : 'document',
            downloads: (f.download_count as number) || 0,
            views: (f.view_count as number) || 0,
            shared: (f.is_public as boolean) || false,
            sharedWith: []
          }))
          setFiles(mappedFiles)
        }

        return result.files?.length || 0
      })(),
      {
        loading: 'Refreshing files...',
        success: (count) => `Loaded ${count} files`,
        error: (err) => err.message || 'Failed to refresh files'
      }
    ).finally(() => setIsLoading(false))
  }, [])

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
    try {
      logger.info('Secure file download initiated', { fileName: file.fileName })

      const response = await fetch(`/api/files/delivery/${file.id}/download`)
      const data = await response.json()

      if (data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl
        toast.success('Download started!', {
          description: file.fileName
        })
      } else {
        throw new Error(data.error || 'Download failed')
      }
    } catch (error) {
      logger.error('Failed to download secure file', { error, fileName: file.fileName })
      toast.error('Failed to download file', {
        description: error.message
      })
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

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
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

            {/* Export Button */}
            <Button
              variant="outline"
              onClick={handleExportFiles}
              disabled={filteredFiles.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadFile(file)
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewFile(file)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
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

                    <div className="grid grid-cols-2 gap-3">
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

                    <div className="grid grid-cols-2 gap-3 py-3 border-y">
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
                        onClick={() => handleShareFile(selectedFile)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCopyLink(selectedFile)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() =>
                          handleDeleteFile(selectedFile.id, selectedFile.name)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
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
      </div>
    </div>
  )
}
