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
  DollarSign
} from 'lucide-react'

// A+++ UTILITIES
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

  // A+++ LOAD FILE DATA
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
  // HANDLER 1: DOWNLOAD FILE
  // ============================================================================

  const handleDownloadFile = useCallback(async (file: ExtendedFile) => {
    try {
      logger.info('File download initiated', {
        fileName: file.name,
        fileSize: file.size,
        project: file.project
      })

      // Simulate API call
      const response = await fetch('/api/client-zone/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      logger.info('File download completed', { fileName: file.name })

      // Simulate download
      const element = document.createElement('a')
      element.setAttribute('href', '#')
      element.setAttribute('download', file.name)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      // Update download count
      setFiles(files.map(f =>
        f.id === file.id
          ? { ...f, downloads: (f.downloads || 0) + 1 }
          : f
      ))

      toast.success('Download started!', {
        description: `${file.name} is downloading`
      })
    } catch (error: any) {
      logger.error('Failed to download file', { error, fileName: file.name })
      toast.error('Failed to download file', {
        description: error.message || 'Please try again later'
      })
    }
  }, [files])

  // ============================================================================
  // HANDLER 2: UPLOAD FILE
  // ============================================================================

  const handleUploadFile = useCallback(async () => {
    try {
      setIsUploading(true)
      logger.info('File upload initiated')

      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.onchange = async (e: any) => {
        const uploadedFiles = e.target.files

        for (const file of uploadedFiles) {
          try {
            logger.info('Uploading file', {
              fileName: file.name,
              fileSize: file.size
            })

            // Simulate API call
            const response = await fetch('/api/client-zone/files/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                fileSize: file.size,
                clientId: KAZI_CLIENT_DATA.clientInfo.email
              })
            })

            if (!response.ok) {
              throw new Error('Failed to upload file')
            }

            // Add file to list
            const newFile: ExtendedFile = {
              id: files.length + 1,
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedBy: KAZI_CLIENT_DATA.clientInfo.contactPerson,
              uploadDate: new Date().toISOString().split('T')[0],
              project: 'Recent Upload',
              type: 'document',
              downloads: 0,
              views: 0,
              shared: false,
              sharedWith: []
            }

            setFiles([newFile, ...files])

            logger.info('File uploaded successfully', { fileName: file.name })
            toast.success('File uploaded!', {
              description: file.name
            })
          } catch (error: any) {
            logger.error('Failed to upload file', { error, fileName: file.name })
            toast.error('Failed to upload file', {
              description: `${file.name}: ${error.message}`
            })
          }
        }
      }
      input.click()
    } finally {
      setIsUploading(false)
    }
  }, [files])

  // ============================================================================
  // HANDLER 3: DELETE FILE
  // ============================================================================

  const handleDeleteFile = useCallback(async (fileId: number, fileName: string) => {
    try {
      logger.info('File deletion initiated', { fileId, fileName })

      const response = await fetch('/api/client-zone/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      setFiles(files.filter(f => f.id !== fileId))
      setSelectedFile(null)

      logger.info('File deleted successfully', { fileId, fileName })
      toast.success('File deleted', {
        description: fileName
      })
    } catch (error: any) {
      logger.error('Failed to delete file', { error, fileId })
      toast.error('Failed to delete file')
    }
  }, [files])

  // ============================================================================
  // HANDLER 4: SHARE FILE
  // ============================================================================

  const handleShareFile = useCallback(async (file: ExtendedFile) => {
    try {
      logger.info('File share initiated', { fileId: file.id, fileName: file.name })

      const response = await fetch('/api/client-zone/files/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to share file')
      }

      logger.info('File shared successfully', { fileId: file.id })
      toast.success('Share link copied!', {
        description: 'File link copied to clipboard'
      })
    } catch (error: any) {
      logger.error('Failed to share file', { error, fileId: file.id })
      toast.error('Failed to share file')
    }
  }, [])

  // ============================================================================
  // HANDLER 5: VIEW FILE
  // ============================================================================

  const handleViewFile = useCallback(async (file: ExtendedFile) => {
    try {
      logger.info('File preview initiated', { fileId: file.id, fileName: file.name })

      // Update view count
      setFiles(files.map(f =>
        f.id === file.id
          ? { ...f, views: (f.views || 0) + 1 }
          : f
      ))

      toast.info('Opening file preview...', {
        description: file.name
      })
    } catch (error: any) {
      logger.error('Failed to open file preview', { error })
      toast.error('Failed to open file preview')
    }
  }, [files])

  // ============================================================================
  // HANDLER 6: COPY FILE LINK
  // ============================================================================

  const handleCopyLink = useCallback(async (file: ExtendedFile) => {
    try {
      const link = `https://files.kazi.io/${file.id}/${file.name}`
      await navigator.clipboard.writeText(link)
      logger.info('File link copied', { fileId: file.id })
      toast.success('Link copied to clipboard!')
    } catch (error: any) {
      logger.error('Failed to copy link', { error })
      toast.error('Failed to copy link')
    }
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
    } catch (error: any) {
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
