'use client'

import React, { useState, useCallback, useEffect, useReducer, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud,
  HardDrive,
  Database,
  Archive,
  Upload,
  Download,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  FileArchive,
  Code,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  Eye,
  Share2,
  Trash2,
  FolderOpen,
  Grid,
  List,
  Plus,
  X,
  Check,
  AlertCircle,
  Server,
  Globe,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'

// Premium Components
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Storage')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type StorageProvider = 'aws' | 'google' | 'azure' | 'dropbox' | 'local'
type FileType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other'
type FileStatus = 'synced' | 'syncing' | 'error' | 'offline'

interface StorageFile {
  id: string
  name: string
  type: FileType
  size: number
  provider: StorageProvider
  status: FileStatus
  path: string
  extension: string
  uploadedAt: string
  modifiedAt: string
  sharedWith: string[]
  isPublic: boolean
  downloadCount: number
  thumbnail?: string
  tags: string[]
  version: number
}

interface StorageState {
  files: StorageFile[]
  selectedFile: StorageFile | null
  searchTerm: string
  filterProvider: StorageProvider | 'all'
  filterType: FileType | 'all'
  filterStatus: FileStatus | 'all'
  sortBy: 'name' | 'size' | 'date' | 'downloads'
  viewMode: 'grid' | 'list'
  selectedFiles: string[]
}

type StorageAction =
  | { type: 'SET_FILES'; files: StorageFile[] }
  | { type: 'ADD_FILE'; file: StorageFile }
  | { type: 'UPDATE_FILE'; file: StorageFile }
  | { type: 'DELETE_FILE'; fileId: string }
  | { type: 'SELECT_FILE'; file: StorageFile | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_PROVIDER'; filterProvider: StorageState['filterProvider'] }
  | { type: 'SET_FILTER_TYPE'; filterType: StorageState['filterType'] }
  | { type: 'SET_FILTER_STATUS'; filterStatus: StorageState['filterStatus'] }
  | { type: 'SET_SORT'; sortBy: StorageState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; viewMode: StorageState['viewMode'] }
  | { type: 'TOGGLE_SELECT_FILE'; fileId: string }
  | { type: 'CLEAR_SELECTED_FILES' }

// ============================================================================
// REDUCER
// ============================================================================

function storageReducer(state: StorageState, action: StorageAction): StorageState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_FILES':
      logger.info('Setting files', { count: action.files.length })
      return { ...state, files: action.files }

    case 'ADD_FILE':
      logger.info('Adding file', { fileId: action.file.id, fileName: action.file.name })
      return { ...state, files: [action.file, ...state.files] }

    case 'UPDATE_FILE':
      logger.info('Updating file', { fileId: action.file.id })
      return {
        ...state,
        files: state.files.map(f => f.id === action.file.id ? action.file : f)
      }

    case 'DELETE_FILE':
      logger.info('Deleting file', { fileId: action.fileId })
      return {
        ...state,
        files: state.files.filter(f => f.id !== action.fileId),
        selectedFile: state.selectedFile?.id === action.fileId ? null : state.selectedFile
      }

    case 'SELECT_FILE':
      logger.debug('Selecting file', { fileName: action.file?.name })
      return { ...state, selectedFile: action.file }

    case 'SET_SEARCH':
      logger.debug('Search term updated', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_PROVIDER':
      logger.debug('Filter provider updated', { filterProvider: action.filterProvider })
      return { ...state, filterProvider: action.filterProvider }

    case 'SET_FILTER_TYPE':
      logger.debug('Filter type updated', { filterType: action.filterType })
      return { ...state, filterType: action.filterType }

    case 'SET_FILTER_STATUS':
      logger.debug('Filter status updated', { filterStatus: action.filterStatus })
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_SORT':
      logger.debug('Sort by updated', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode updated', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_FILE':
      const isSelected = state.selectedFiles.includes(action.fileId)
      logger.debug('Toggle select file', { fileId: action.fileId, isSelected: !isSelected })
      return {
        ...state,
        selectedFiles: isSelected
          ? state.selectedFiles.filter(id => id !== action.fileId)
          : [...state.selectedFiles, action.fileId]
      }

    case 'CLEAR_SELECTED_FILES':
      logger.debug('Clearing selected files')
      return { ...state, selectedFiles: [] }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockStorageFiles = (): StorageFile[] => {
  logger.debug('Generating mock storage files')

  const providers: StorageProvider[] = ['aws', 'google', 'azure', 'dropbox', 'local']
  const types: FileType[] = ['document', 'image', 'video', 'audio', 'archive', 'code']
  const statuses: FileStatus[] = ['synced', 'syncing', 'error', 'offline']

  const fileNames = [
    'Project Proposal.pdf', 'Annual Report 2024.docx', 'Budget Spreadsheet.xlsx',
    'Team Photo.jpg', 'Product Banner.png', 'Logo Design.svg',
    'Marketing Video.mp4', 'Tutorial Screencast.mov', 'Demo Recording.webm',
    'Podcast Episode 1.mp3', 'Background Music.wav', 'Interview Audio.flac',
    'Project Archive.zip', 'Backup Files.tar.gz', 'Source Code.7z',
    'Main Application.js', 'API Server.py', 'Database Schema.sql',
    'Meeting Notes.txt', 'README.md', 'Configuration.json',
    'Presentation Slides.pptx', 'Invoice Template.pdf', 'Contract Draft.docx',
    'Product Mockup.fig', 'UI Designs.sketch', 'Brand Guidelines.pdf',
    'Client Feedback.csv', 'Sales Data.xlsx', 'Analytics Report.pdf',
    'Website Backup.zip', 'App Source Code.tar', 'Build Artifacts.zip',
    'Training Materials.pdf', 'Onboarding Guide.docx', 'Company Handbook.pdf',
    'Profile Picture.jpg', 'Cover Image.png', 'Thumbnail.webp',
    'Promotional Video.mp4', 'Tutorial Series.mov', 'Webinar Recording.mp4',
    'Intro Music.mp3', 'Sound Effects.wav', 'Voice Over.m4a'
  ]

  const files: StorageFile[] = fileNames.map((name, index) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const extension = name.split('.').pop() || 'file'

    return {
      id: `SF-${String(index + 1).padStart(3, '0')}`,
      name,
      type,
      size: Math.floor(Math.random() * 100000000) + 10000, // 10KB - 100MB
      provider: providers[Math.floor(Math.random() * providers.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      path: `/storage/${providers[Math.floor(Math.random() * providers.length)]}/${name}`,
      extension,
      uploadedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      modifiedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sharedWith: Math.random() > 0.7 ? ['user@example.com', 'team@example.com'] : [],
      isPublic: Math.random() > 0.8,
      downloadCount: Math.floor(Math.random() * 500),
      tags: ['work', 'important', 'project'].slice(0, Math.floor(Math.random() * 3) + 1),
      version: Math.floor(Math.random() * 5) + 1
    }
  })

  logger.info('Generated mock storage files', { count: files.length })
  return files
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StoragePage() {
  logger.debug('Component mounting')

  // A+++ UTILITIES
  const { announce } = useAnnouncer()

  // STATE
  const [state, dispatch] = useReducer(storageReducer, {
    files: [],
    selectedFile: null,
    searchTerm: '',
    filterProvider: 'all',
    filterType: 'all',
    filterStatus: 'all',
    sortBy: 'date',
    viewMode: 'grid',
    selectedFiles: []
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // MODALS
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // FORM STATES
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [uploadProvider, setUploadProvider] = useState<StorageProvider>('aws')
  const [movePath, setMovePath] = useState('')
  const [shareEmail, setShareEmail] = useState('')
  const [shareEmails, setShareEmails] = useState<string[]>([])

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    logger.info('Loading storage files from API')

    const loadFiles = async () => {
      try {
        setIsLoading(true)

        const response = await fetch('/api/files')
        const result = await response.json()

        if (result.success && result.files) {
          dispatch({ type: 'SET_FILES', files: result.files })
          logger.info('Files loaded successfully from API', { count: result.files.length })
          announce('Storage dashboard loaded', 'polite')
        } else {
          throw new Error(result.error || 'Failed to load files')
        }
      } catch (error) {
        logger.error('Storage files load error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorObject: error
        })
        toast.error('Failed to load storage files')
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    logger.debug('Calculating storage stats')

    const totalFiles = state.files.length
    const totalSize = state.files.reduce((sum, f) => sum + (f.size || 0), 0)
    const syncedFiles = state.files.filter(f => f.status === 'synced').length
    const sharedFiles = state.files.filter(f => (f.sharedWith?.length || 0) > 0 || f.isPublic).length
    const totalDownloads = state.files.reduce((sum, f) => sum + (f.downloadCount || 0), 0)

    const providerStats = {
      aws: state.files.filter(f => f.provider === 'aws').length,
      google: state.files.filter(f => f.provider === 'google').length,
      azure: state.files.filter(f => f.provider === 'azure').length,
      dropbox: state.files.filter(f => f.provider === 'dropbox').length,
      local: state.files.filter(f => f.provider === 'local').length
    }

    const result = {
      totalFiles,
      totalSize,
      syncedFiles,
      sharedFiles,
      totalDownloads,
      providerStats
    }

    logger.debug('Stats calculated', result)
    return result
  }, [state.files])

  const filteredAndSortedFiles = useMemo(() => {
    logger.debug('Filtering and sorting files', {
      searchTerm: state.searchTerm,
      filterProvider: state.filterProvider,
      filterType: state.filterType,
      filterStatus: state.filterStatus,
      sortBy: state.sortBy
    })

    let filtered = [...state.files]

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        f.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
    }

    // Filter by provider
    if (state.filterProvider !== 'all') {
      filtered = filtered.filter(f => f.provider === state.filterProvider)
    }

    // Filter by type
    if (state.filterType !== 'all') {
      filtered = filtered.filter(f => f.type === state.filterType)
    }

    // Filter by status
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === state.filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'downloads':
          return b.downloadCount - a.downloadCount
        default:
          return 0
      }
    })

    logger.debug('Filter and sort complete', { resultCount: filtered.length })
    return filtered
  }, [state.files, state.searchTerm, state.filterProvider, state.filterType, state.filterStatus, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleUploadFiles = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      logger.warn('No files selected for upload')
      toast.error('Please select files to upload')
      return
    }

    const totalSize = Array.from(uploadFiles).reduce((sum, f) => sum + f.size, 0)
    logger.info('Uploading files', {
      count: uploadFiles.length,
      provider: uploadProvider,
      totalSize
    })

    try {
      setIsSaving(true)
      const uploadedFiles: string[] = []

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        logger.debug(`Processing file ${i + 1}/${uploadFiles.length}`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })

        const extension = file.name.split('.').pop() || 'file'
        const type = getFileType(extension)

        const response = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload-file',
            data: {
              name: file.name,
              type,
              size: file.size,
              parentFolder: uploadProvider
            }
          })
        })

        const result = await response.json()

        if (result.success && result.file) {
          const newFile: StorageFile = {
            id: result.file.id,
            name: result.file.name,
            type,
            size: result.file.size,
            provider: uploadProvider,
            status: 'synced',
            path: `/storage/${uploadProvider}/${file.name}`,
            extension,
            uploadedAt: result.file.uploadedAt,
            modifiedAt: new Date().toISOString(),
            sharedWith: [],
            isPublic: false,
            downloadCount: 0,
            tags: [],
            version: result.file.version
          }

          dispatch({ type: 'ADD_FILE', file: newFile })
          uploadedFiles.push(file.name)

          logger.info('File uploaded successfully', {
            fileName: file.name,
            fileSize: file.size,
            provider: uploadProvider,
            fileId: result.file.id
          })
        } else {
          throw new Error(result.error || 'Failed to upload file')
        }
      }

      toast.success(`Uploaded ${uploadFiles.length} file(s)`, {
        description: `${formatFileSize(totalSize)} - ${uploadProvider.toUpperCase()} - Files: ${uploadedFiles.slice(0, 3).join(', ')}${uploadedFiles.length > 3 ? ` +${uploadedFiles.length - 3} more` : ''}`
      })
      setIsUploadModalOpen(false)
      setUploadFiles(null)
    } catch (error: any) {
      logger.error('File upload failed', {
        error: error.message,
        provider: uploadProvider,
        fileCount: uploadFiles.length
      })
      toast.error('Failed to upload files', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    const file = state.files.find(f => f.id === fileId)
    logger.info('Deleting file', {
      fileId,
      fileName: file?.name,
      fileSize: file?.size,
      provider: file?.provider
    })

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-files',
          data: { fileIds: [fileId] }
        })
      })

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'DELETE_FILE', fileId })

        logger.info('File deleted successfully', {
          fileId,
          fileName: file?.name
        })

        toast.success('File deleted', {
          description: `${file?.name} - ${formatFileSize(file?.size || 0)} - ${file?.provider?.toUpperCase()} - Removed from storage`
        })
        setIsDeleteModalOpen(false)
      } else {
        throw new Error(result.error || 'Failed to delete file')
      }
    } catch (error: any) {
      logger.error('File delete failed', {
        error: error.message,
        fileId,
        fileName: file?.name
      })
      toast.error('Failed to delete file', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleBulkDelete = async () => {
    const selectedFilesData = state.files.filter(f => state.selectedFiles.includes(f.id))
    const totalSize = selectedFilesData.reduce((sum, f) => sum + f.size, 0)

    logger.info('Bulk deleting files', {
      count: state.selectedFiles.length,
      totalSize,
      fileIds: state.selectedFiles
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-files',
          data: { fileIds: state.selectedFiles }
        })
      })

      const result = await response.json()

      if (result.success) {
        state.selectedFiles.forEach(fileId => {
          dispatch({ type: 'DELETE_FILE', fileId })
        })

        logger.info('Bulk delete complete', {
          deletedCount: result.deletedCount || state.selectedFiles.length,
          totalSize
        })

        toast.success(`Deleted ${state.selectedFiles.length} file(s)`, {
          description: `${formatFileSize(totalSize)} freed - ${selectedFilesData.slice(0, 3).map(f => f.name).join(', ')}${selectedFilesData.length > 3 ? ` +${selectedFilesData.length - 3} more` : ''}`
        })
        dispatch({ type: 'CLEAR_SELECTED_FILES' })
      } else {
        throw new Error(result.error || 'Failed to delete files')
      }
    } catch (error: any) {
      logger.error('Bulk delete failed', {
        error: error.message,
        count: state.selectedFiles.length
      })
      toast.error('Failed to delete files', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveFile = async () => {
    if (!state.selectedFile || !movePath) {
      logger.warn('Missing file or destination path for move operation')
      toast.error('Please specify destination path')
      return
    }

    logger.info('Moving file', {
      fileName: state.selectedFile.name,
      currentPath: state.selectedFile.path,
      targetPath: movePath
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move-files',
          data: {
            fileIds: [state.selectedFile.id],
            targetFolder: movePath
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const updatedFile = {
          ...state.selectedFile,
          path: movePath,
          modifiedAt: new Date().toISOString()
        }

        dispatch({ type: 'UPDATE_FILE', file: updatedFile })

        logger.info('File moved successfully', {
          fileName: state.selectedFile.name,
          fromPath: state.selectedFile.path,
          toPath: movePath
        })

        toast.success('File moved', {
          description: `${state.selectedFile.name} - ${formatFileSize(state.selectedFile.size)} - From: ${state.selectedFile.path} → To: ${movePath}`
        })
        setIsMoveModalOpen(false)
        setMovePath('')
      } else {
        throw new Error(result.error || 'Failed to move file')
      }
    } catch (error: any) {
      logger.error('File move failed', {
        error: error.message,
        fileName: state.selectedFile?.name,
        targetPath: movePath
      })
      toast.error('Failed to move file', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareFile = async () => {
    if (!state.selectedFile) {
      logger.warn('No file selected for sharing')
      return
    }

    logger.info('Sharing file', {
      fileName: state.selectedFile.name,
      recipients: shareEmails,
      recipientCount: shareEmails.length
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share-file',
          data: {
            fileIds: [state.selectedFile.id],
            recipients: shareEmails,
            permissions: 'view'
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const updatedFile = {
          ...state.selectedFile,
          sharedWith: [...state.selectedFile.sharedWith, ...shareEmails]
        }

        dispatch({ type: 'UPDATE_FILE', file: updatedFile })

        logger.info('File shared successfully', {
          fileName: state.selectedFile.name,
          recipientCount: shareEmails.length,
          totalSharedWith: updatedFile.sharedWith.length
        })

        toast.success('File shared', {
          description: `${state.selectedFile.name} - ${formatFileSize(state.selectedFile.size)} - Shared with: ${shareEmails.join(', ')} - Total: ${updatedFile.sharedWith.length} users`
        })
        setIsShareModalOpen(false)
        setShareEmail('')
        setShareEmails([])
      } else {
        throw new Error(result.error || 'Failed to share file')
      }
    } catch (error: any) {
      logger.error('File share failed', {
        error: error.message,
        fileName: state.selectedFile?.name,
        recipients: shareEmails
      })
      toast.error('Failed to share file', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async (fileId: string) => {
    const file = state.files.find(f => f.id === fileId)
    logger.info('Downloading file', {
      fileId,
      fileName: file?.name,
      fileSize: file?.size,
      provider: file?.provider
    })

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'download-file',
          data: { fileId }
        })
      })

      const result = await response.json()

      if (result.success) {
        if (file) {
          const updatedFile = {
            ...file,
            downloadCount: file.downloadCount + 1
          }
          dispatch({ type: 'UPDATE_FILE', file: updatedFile })

          logger.info('Download initiated successfully', {
            fileName: file.name,
            newDownloadCount: updatedFile.downloadCount
          })

          toast.success('Download started', {
            description: `${file.name} - ${formatFileSize(file.size)} - ${file.provider.toUpperCase()} - Total downloads: ${updatedFile.downloadCount}`
          })
        }
      } else {
        throw new Error(result.error || 'Failed to download file')
      }
    } catch (error: any) {
      logger.error('File download failed', {
        error: error.message,
        fileId,
        fileName: file?.name
      })
      toast.error('Failed to download file', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'document': return FileText
      case 'image': return Image
      case 'video': return Video
      case 'audio': return Music
      case 'archive': return FileArchive
      case 'code': return Code
      default: return File
    }
  }

  const getFileType = (extension: string): FileType => {
    const ext = extension.toLowerCase()
    if (['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx'].includes(ext)) return 'document'
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext)) return 'audio'
    if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return 'archive'
    if (['js', 'ts', 'py', 'java', 'cpp', 'sql'].includes(ext)) return 'code'
    return 'other'
  }

  const getProviderIcon = (provider: StorageProvider) => {
    switch (provider) {
      case 'aws': return Server
      case 'google': return Globe
      case 'azure': return Cloud
      case 'dropbox': return Database
      case 'local': return HardDrive
      default: return Archive
    }
  }

  const getProviderColor = (provider: StorageProvider) => {
    switch (provider) {
      case 'aws': return 'text-orange-500'
      case 'google': return 'text-blue-500'
      case 'azure': return 'text-cyan-500'
      case 'dropbox': return 'text-indigo-500'
      case 'local': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadgeColor = (status: FileStatus) => {
    switch (status) {
      case 'synced': return 'bg-green-500/10 text-green-500'
      case 'syncing': return 'bg-blue-500/10 text-blue-500'
      case 'error': return 'bg-red-500/10 text-red-500'
      case 'offline': return 'bg-gray-500/10 text-gray-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
        <div className="container mx-auto px-4 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
                <Archive className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
                  <TextShimmer>Storage & Files</TextShimmer>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Multi-cloud storage management
                </p>
              </div>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </ScrollReveal>

        {/* Stats Dashboard */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Files */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.totalFiles} />
                  </p>
                </div>
                <div className="relative">
                  
                  <File className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Total Storage */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
                <div className="relative">
                  
                  <HardDrive className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Synced Files */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Synced</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.syncedFiles} />
                  </p>
                </div>
                <div className="relative">
                  
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Downloads */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.totalDownloads} />
                  </p>
                </div>
                <div className="relative">
                  
                  <Download className="h-8 w-8 text-cyan-500" />
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </ScrollReveal>

        {/* Filters & Search */}
        <ScrollReveal>
          <LiquidGlassCard className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={state.searchTerm}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Provider Filter */}
              <Select
                value={state.filterProvider}
                onValueChange={(value) => dispatch({ type: 'SET_FILTER_PROVIDER', filterProvider: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="google">Google Cloud</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={state.filterType}
                onValueChange={(value) => dispatch({ type: 'SET_FILTER_TYPE', filterType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={state.sortBy}
                onValueChange={(value) => dispatch({ type: 'SET_SORT', sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex gap-2">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'grid' })}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'list' })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {state.selectedFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {state.selectedFiles.length} file(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch({ type: 'CLEAR_SELECTED_FILES' })}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Files Grid/List */}
        {filteredAndSortedFiles.length === 0 ? (
          <ScrollReveal>
            <NoDataEmptyState
              title="No files found"
              message="Upload files or adjust your filters"
              action={{
                label: 'Upload Files',
                onClick: () => setIsUploadModalOpen(true)
              }}
            />
          </ScrollReveal>
        ) : state.viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type)
              const ProviderIcon = getProviderIcon(file.provider)

              return (
                <ScrollReveal key={file.id} delay={index * 0.05}>
                  <LiquidGlassCard className="p-4 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={state.selectedFiles.includes(file.id)}
                            onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: file.id })}
                          />
                          <FileIcon className="h-5 w-5 text-violet-500" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              dispatch({ type: 'SELECT_FILE', file })
                              setIsViewModalOpen(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              dispatch({ type: 'SELECT_FILE', file })
                              setIsShareModalOpen(true)
                            }}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              dispatch({ type: 'SELECT_FILE', file })
                              setIsMoveModalOpen(true)
                            }}>
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                dispatch({ type: 'SELECT_FILE', file })
                                setIsDeleteModalOpen(true)
                              }}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* File Info */}
                      <div>
                        <p className="font-medium kazi-text-dark dark:kazi-text-light text-sm line-clamp-2">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      {/* Provider & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <ProviderIcon className={`h-4 w-4 ${getProviderColor(file.provider)}`} />
                          <span className="text-xs text-muted-foreground capitalize">{file.provider}</span>
                        </div>
                        <Badge className={getStatusBadgeColor(file.status)}>
                          {file.status}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {file.downloadCount}
                        </div>
                        {file.sharedWith.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {file.sharedWith.length}
                          </div>
                        )}
                        {file.isPublic && (
                          <Badge variant="outline" className="text-xs">Public</Badge>
                        )}
                      </div>
                    </div>
                  </LiquidGlassCard>
                </ScrollReveal>
              )
            })}
          </div>
        ) : (
          <ScrollReveal>
            <LiquidGlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={state.selectedFiles.length === filteredAndSortedFiles.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              filteredAndSortedFiles.forEach(f => {
                                if (!state.selectedFiles.includes(f.id)) {
                                  dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: f.id })
                                }
                              })
                            } else {
                              dispatch({ type: 'CLEAR_SELECTED_FILES' })
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Downloads</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Modified</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type)
                      const ProviderIcon = getProviderIcon(file.provider)

                      return (
                        <tr key={file.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={state.selectedFiles.includes(file.id)}
                              onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: file.id })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-violet-500 shrink-0" />
                              <span className="text-sm font-medium kazi-text-dark dark:kazi-text-light truncate max-w-xs">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <ProviderIcon className={`h-4 w-4 ${getProviderColor(file.provider)}`} />
                              <span className="text-sm capitalize">{file.provider}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusBadgeColor(file.status)}>
                              {file.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {file.downloadCount}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(file.modifiedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  dispatch({ type: 'SELECT_FILE', file })
                                  setIsViewModalOpen(true)
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  dispatch({ type: 'SELECT_FILE', file })
                                  setIsShareModalOpen(true)
                                }}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    dispatch({ type: 'SELECT_FILE', file })
                                    setIsDeleteModalOpen(true)
                                  }}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Upload Modal */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Upload files to your cloud storage
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Select Files</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="mt-2"
                />
                {uploadFiles && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div>
                <Label>Storage Provider</Label>
                <Select value={uploadProvider} onValueChange={(v) => setUploadProvider(v as StorageProvider)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">AWS S3</SelectItem>
                    <SelectItem value="google">Google Cloud</SelectItem>
                    <SelectItem value="azure">Azure Blob</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="local">Local Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadFiles} disabled={isSaving}>
                {isSaving ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>File Details</DialogTitle>
            </DialogHeader>

            {state.selectedFile && (
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="sharing">Sharing</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedFile.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Size</Label>
                      <p className="text-sm font-medium mt-1">{formatFileSize(state.selectedFile.size)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <p className="text-sm font-medium mt-1 capitalize">{state.selectedFile.type}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Extension</Label>
                      <p className="text-sm font-medium mt-1">.{state.selectedFile.extension}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Provider</Label>
                      <p className="text-sm font-medium mt-1 capitalize">{state.selectedFile.provider}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge className={`${getStatusBadgeColor(state.selectedFile.status)} mt-1`}>
                        {state.selectedFile.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Uploaded</Label>
                      <p className="text-sm font-medium mt-1">{formatDate(state.selectedFile.uploadedAt)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Modified</Label>
                      <p className="text-sm font-medium mt-1">{formatDate(state.selectedFile.modifiedAt)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Downloads</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedFile.downloadCount}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Version</Label>
                      <p className="text-sm font-medium mt-1">v{state.selectedFile.version}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Path</Label>
                    <p className="text-sm font-medium mt-1 font-mono bg-muted p-2 rounded">
                      {state.selectedFile.path}
                    </p>
                  </div>
                  {state.selectedFile.tags.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Tags</Label>
                      <div className="flex gap-2 mt-2">
                        {state.selectedFile.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sharing" className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Access</Label>
                    <p className="text-sm mt-1">
                      {state.selectedFile.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  {state.selectedFile.sharedWith.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Shared With</Label>
                      <div className="space-y-2 mt-2">
                        {state.selectedFile.sharedWith.map((email, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                            <Share2 className="h-4 w-4" />
                            {email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted rounded">
                      <Upload className="h-4 w-4 mt-1 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">File uploaded</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(state.selectedFile.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    {state.selectedFile.downloadCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-muted rounded">
                        <Download className="h-4 w-4 mt-1 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Downloaded {state.selectedFile.downloadCount} times</p>
                          <p className="text-xs text-muted-foreground">Last download recently</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Move Modal */}
        <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move File</DialogTitle>
              <DialogDescription>
                Move {state.selectedFile?.name} to a new location
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Destination Path</Label>
                <Input
                  value={movePath}
                  onChange={(e) => setMovePath(e.target.value)}
                  placeholder="/storage/folder/subfolder"
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMoveModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMoveFile} disabled={isSaving}>
                {isSaving ? 'Moving...' : 'Move File'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share File</DialogTitle>
              <DialogDescription>
                Share {state.selectedFile?.name} with others
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                  <Button
                    onClick={() => {
                      if (shareEmail && !shareEmails.includes(shareEmail)) {
                        setShareEmails([...shareEmails, shareEmail])
                        setShareEmail('')
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {shareEmails.length > 0 && (
                <div>
                  <Label>Recipients</Label>
                  <div className="space-y-2 mt-2">
                    {shareEmails.map((email, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShareEmails(shareEmails.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareFile} disabled={isSaving || shareEmails.length === 0}>
                {isSaving ? 'Sharing...' : 'Share File'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {state.selectedFile?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => state.selectedFile && handleDeleteFile(state.selectedFile.id)}
              >
                Delete File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
