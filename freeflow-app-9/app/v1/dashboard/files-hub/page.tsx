'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useReducer, useMemo, useDeferredValue } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  File, Upload, Download, Share2, Star, Trash2,
  Search, Eye, Clock, FileArchive, Grid, List, Cloud, Copy, HardDrive, TrendingUp,
  Lock, FileCheck, Info, Zap, Sparkles
} from 'lucide-react'
import { NumberFlow } from '@/components/ui/number-flow'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// CLOUD STORAGE INTEGRATION COMPONENTS
import { StorageProvidersCard } from '@/components/storage/storage-providers-card'
import { UnifiedFileBrowser } from '@/components/storage/unified-file-browser'
import { StorageQuotaCard } from '@/components/storage/storage-quota-card'
import { StorageActivityLog } from '@/components/storage/storage-activity-log'
import { StorageOnboardingWizard } from '@/components/storage/storage-onboarding-wizard'
import { useStorageOnboarding } from '@/lib/hooks/use-storage-onboarding'

const logger = createFeatureLogger('FilesHub')

// ============================================================================
// FRAMER MOTION ANIMATION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

const PulsingDot = ({ color = 'green' }: { color?: string }) => {
  return (
    <motion.div
      className={`w-2 h-2 bg-${color}-500 rounded-full`}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

// ============================================================================
// IMPORTS - SESSION 9 REFACTORED UTILITIES
// ============================================================================

import {
  // Types
  FileItem,
  FilesHubState,
  FilesHubAction,

  // Helper Functions
  formatFileSize,
  getFileIcon,
  getFileExtension,
  getFileType,
  formatDate,
  getFileTypeColor
} from '@/lib/files-hub-utils'

// ============================================================================
// REDUCER
// ============================================================================

function filesHubReducer(state: FilesHubState, action: FilesHubAction): FilesHubState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_FILES':
      logger.info('Setting files', { count: action.files.length })
      return { ...state, files: action.files }

    case 'ADD_FILE':
      logger.info('File added', { fileId: action.file.id, fileName: action.file.name, fileType: action.file.type })
      return { ...state, files: [action.file, ...state.files] }

    case 'ADD_FILES':
      logger.info('Multiple files added', { count: action.payload.length })
      return { ...state, files: [...action.payload, ...state.files] }

    case 'UPDATE_FILE':
      logger.info('File updated', { fileId: action.file.id, fileName: action.file.name })
      return {
        ...state,
        files: state.files.map(f => f.id === action.file.id ? action.file : f)
      }

    case 'DELETE_FILE':
      const deletedFile = state.files.find(f => f.id === action.fileId)
      logger.info('File deleted', { fileId: action.fileId, fileName: deletedFile?.name })
      return {
        ...state,
        files: state.files.filter(f => f.id !== action.fileId),
        selectedFile: state.selectedFile?.id === action.fileId ? null : state.selectedFile
      }

    case 'SELECT_FILE':
      logger.debug('File selected', { fileName: action.file?.name || 'None', fileId: action.file?.id })
      return { ...state, selectedFile: action.file }

    case 'SET_SEARCH':
      logger.debug('Search term changed', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER':
      logger.debug('Filter changed', { filterType: action.filterType })
      return { ...state, filterType: action.filterType }

    case 'SET_SORT':
      logger.debug('Sort changed', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_FILE':
      const isSelected = state.selectedFiles.includes(action.fileId)
      logger.debug(isSelected ? 'File deselected' : 'File selected', { fileId: action.fileId })
      return {
        ...state,
        selectedFiles: isSelected
          ? state.selectedFiles.filter(id => id !== action.fileId)
          : [...state.selectedFiles, action.fileId]
      }

    case 'CLEAR_SELECTED_FILES':
      logger.info('Cleared selected files', { clearedCount: state.selectedFiles.length })
      return { ...state, selectedFiles: [] }

    case 'TOGGLE_STAR':
      const starredFile = state.files.find(f => f.id === action.fileId)
      logger.info('Toggled file star', { fileId: action.fileId, newStarred: !starredFile?.starred })
      return {
        ...state,
        files: state.files.map(f =>
          f.id === action.fileId ? { ...f, starred: !f.starred } : f
        )
      }

    case 'SET_FOLDER':
      logger.info('Folder changed', { folder: action.folder })
      return { ...state, currentFolder: action.folder }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA - Now imported from files-hub-utils.tsx
// ============================================================================
// Mock data is now managed in @/lib/files-hub-utils
// Includes 60+ diverse files and 15+ folders with comprehensive metadata

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FilesHubPage() {
  // A+++ ANNOUNCER
  const { announce } = useAnnouncer()

  // REDUCER STATE
  const [state, dispatch] = useReducer(filesHubReducer, {
    files: [],
    selectedFile: null,
    searchTerm: '',
    filterType: 'all',
    sortBy: 'date',
    viewMode: 'grid',
    selectedFiles: [],
    currentFolder: 'All Files'
  })

  // AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // STORAGE ONBOARDING WIZARD
  const {
    showWizard,
    setShowWizard,
    handleComplete: handleOnboardingComplete,
    handleSkip: handleOnboardingSkip
  } = useStorageOnboarding()

  // LOCAL STATE
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // MODAL STATES
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)

  // FORM DATA
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [shareEmails, setShareEmails] = useState('')
  const [moveToFolder, setMoveToFolder] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    const loadFilesData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        return
      }

      try {
        setIsPageLoading(true)
        setError(null)

        logger.info('Loading files from Supabase', { userId })

        // Dynamic import for code splitting
        const { getFiles, getFolders } = await import('@/lib/files-hub-queries')

        const { data: filesData, error: filesError } = await getFiles(
          userId,
          undefined, // no filters
          { field: 'uploaded_at', direction: 'desc' }, // sort by newest
          100 // limit
        )

        if (filesError) throw new Error(filesError.message)

        // Transform database format to UI format
        const transformedFiles: FileItem[] = filesData.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          url: f.url,
          extension: f.extension,
          uploadedAt: f.uploaded_at,
          uploadedBy: {
            id: f.user_id,
            name: 'Current User',
            avatar: ''
          },
          modifiedAt: f.updated_at,
          folder: f.folder_id || 'All Files',
          tags: [],
          shared: f.is_shared,
          starred: f.is_starred,
          locked: false,
          downloads: f.downloads,
          views: f.views,
          version: 1,
          accessLevel: f.access_level
        }))

        dispatch({ type: 'SET_FILES', files: transformedFiles })

        setIsPageLoading(false)
        announce(`${transformedFiles.length} files loaded from database`, 'polite')

        toast.success(`${transformedFiles.length} files loaded from Supabase - ${formatFileSize(filesData.reduce((sum, f) => sum + f.size, 0))} total`)

        logger.info('Files loaded successfully', {
          count: transformedFiles.length,
          userId
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load files'
        logger.error('Failed to load files', { error: err, userId })
        setError(errorMessage)
        setIsPageLoading(false)
        announce('Error loading files', 'assertive')
        toast.error('Failed to load files', {
          description: errorMessage
        })
      }
    }

    loadFilesData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // COMPUTED STATS
  // ============================================================================

  const stats = useMemo(() => {
    const s = {
      total: state.files.length,
      documents: state.files.filter(f => f.type === 'document').length,
      images: state.files.filter(f => f.type === 'image').length,
      videos: state.files.filter(f => f.type === 'video').length,
      totalSize: state.files.reduce((sum, f) => sum + f.size, 0),
      starred: state.files.filter(f => f.starred).length,
      shared: state.files.filter(f => f.shared).length,
      totalDownloads: state.files.reduce((sum, f) => sum + f.downloads, 0),
      totalViews: state.files.reduce((sum, f) => sum + f.views, 0)
    }
    logger.debug('Stats calculated', s)
    return s
  }, [state.files])

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================

  // Use deferred value for search to keep input responsive during expensive filtering
  const deferredSearchTerm = useDeferredValue(state.searchTerm)

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = state.files

    // Filter by search term (using deferred value for better performance)
    if (deferredSearchTerm) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(deferredSearchTerm.toLowerCase()))
      )
    }

    // Filter by type
    if (state.filterType !== 'all') {
      if (state.filterType === 'starred') {
        filtered = filtered.filter(f => f.starred)
      } else {
        filtered = filtered.filter(f => f.type === state.filterType)
      }
    }

    // Filter by folder
    if (state.currentFolder !== 'All Files') {
      filtered = filtered.filter(f => f.folder === state.currentFolder)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'size':
          return b.size - a.size
        case 'type':
          return a.type.localeCompare(b.type)
        case 'downloads':
          return b.downloads - a.downloads
        case 'views':
          return b.views - a.views
        default:
          return 0
      }
    })

    logger.debug('Files filtered and sorted', {
      totalFiles: state.files.length,
      filteredCount: sorted.length,
      searchTerm: deferredSearchTerm,
      filterType: state.filterType,
      sortBy: state.sortBy,
      currentFolder: state.currentFolder
    })

    return sorted
  }, [state.files, deferredSearchTerm, state.filterType, state.sortBy, state.currentFolder])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleUploadFiles = async () => {
    if (!userId) {
      logger.warn('Upload failed', { reason: 'User not authenticated' })
      toast.error('Authentication required', { description: 'Please log in to upload files' })
      announce('Authentication required', 'assertive')
      return
    }

    if (!uploadFiles || uploadFiles.length === 0) {
      logger.warn('Upload validation failed', { reason: 'No files selected' })
      toast.error('No files selected', { description: 'Please select at least one file to upload' })
      return
    }

    setIsUploading(true)
    const uploadedFiles: any[] = []
    const failedFiles: string[] = []
    const files = Array.from(uploadFiles)

    // Create supabase client for storage operations
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    logger.info('Starting file upload', {
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      userId
    })

    for (const file of files) {
      try {
        // 1. Validate file size (50MB limit)
        const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
        if (file.size > MAX_FILE_SIZE) {
          logger.warn('File too large', { fileName: file.name, size: file.size })
          failedFiles.push(`${file.name} (too large)`)
          continue
        }

        // 2. Generate unique file path
        const fileExt = file.name.split('.').pop() || 'bin'
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(7)
        const storagePath = `${userId}/${timestamp}-${randomId}.${fileExt}`

        logger.info('Uploading file to storage', {
          fileName: file.name,
          storagePath,
          size: file.size
        })

        // 3. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('user-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          logger.error('Storage upload failed', {
            error: uploadError,
            fileName: file.name
          })
          failedFiles.push(file.name)
          continue
        }

        // 4. Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('user-files')
          .getPublicUrl(storagePath)

        logger.info('File uploaded to storage', {
          fileName: file.name,
          publicUrl
        })

        // 5. Determine file type
        const ext = getFileExtension(file.name)
        const type = getFileType(ext)

        // 6. Create database record
        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            user_id: userId,
            name: file.name,
            type: type,
            extension: ext,
            size: file.size,
            url: publicUrl,
            storage_path: storagePath,
            storage_provider: 'supabase',
            mime_type: file.type || 'application/octet-stream',
            is_starred: false,
            is_shared: false,
            folder_id: state.currentFolder !== 'All Files' ? state.currentFolder : null,
            status: 'active',
            access_level: 'private',
            downloads: 0,
            views: 0
          })
          .select()
          .single()

        if (dbError) {
          logger.error('Database insert failed', {
            error: dbError,
            fileName: file.name
          })

          // Clean up storage file since DB insert failed
          await supabase.storage.from('user-files').remove([storagePath])

          failedFiles.push(file.name)
          continue
        }

        // Transform to UI format
        const uiFile: FileItem = {
          id: fileRecord.id,
          name: fileRecord.name,
          type: fileRecord.type,
          size: fileRecord.size,
          url: fileRecord.url,
          extension: fileRecord.extension,
          uploadedAt: fileRecord.uploaded_at,
          uploadedBy: {
            id: userId,
            name: 'Current User',
            avatar: ''
          },
          modifiedAt: fileRecord.updated_at,
          folder: fileRecord.folder_id || 'All Files',
          tags: [],
          shared: fileRecord.is_shared,
          starred: fileRecord.is_starred,
          locked: false,
          downloads: fileRecord.downloads,
          views: fileRecord.views,
          version: 1,
          accessLevel: fileRecord.access_level
        }

        uploadedFiles.push(uiFile)

        logger.info('File upload complete', {
          fileId: fileRecord.id,
          fileName: file.name
        })

      } catch (error) {
        logger.error('Unexpected upload error', {
          error,
          fileName: file.name
        })
        failedFiles.push(file.name)
      }
    }

    setIsUploading(false)
    setIsUploadModalOpen(false)
    setUploadFiles(null)

    // Update UI with uploaded files
    if (uploadedFiles.length > 0) {
      dispatch({ type: 'ADD_FILES', payload: uploadedFiles })

      const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0)
      const formattedSize = formatFileSize(totalSize)

      toast.success(`${uploadedFiles.length} file(s) uploaded! Total size: ${formattedSize}`)

      announce(`${uploadedFiles.length} files uploaded successfully`, 'polite')
    }

    // Show errors for failed files
    if (failedFiles.length > 0) {
      toast.error(`${failedFiles.length} file(s) failed to upload`, {
        description: failedFiles.slice(0, 3).join(', ') +
          (failedFiles.length > 3 ? '...' : '')
      })

      announce(`${failedFiles.length} files failed to upload`, 'assertive')
    }

    logger.info('Upload batch complete', {
      successful: uploadedFiles.length,
      failed: failedFiles.length
    })
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!userId) {
      toast.error('Please log in to delete files')
      return
    }

    const file = state.files.find(f => f.id === fileId)
    if (!file) {
      toast.error('File not found')
      return
    }

    try {
      logger.info('Deleting file', {
        fileId,
        fileName: file.name
      })

      // 1. Get file details from database to get storage_path
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('storage_path, storage_provider')
        .eq('id', fileId)
        .single()

      if (fetchError) {
        logger.error('Failed to fetch file details', { error: fetchError, fileId })
        toast.error('Failed to delete file')
        return
      }

      // 2. Delete from Supabase Storage (if file has storage_path)
      if (fileData.storage_path && fileData.storage_provider === 'supabase') {
        const { error: storageError } = await supabase
          .storage
          .from('user-files')
          .remove([fileData.storage_path])

        if (storageError) {
          logger.error('Storage deletion failed', {
            error: storageError,
            fileId
          })
          toast.error('Failed to delete file from storage')
          return
        }
      }

      // 3. Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId) // Security: ensure user owns this file

      if (dbError) {
        logger.error('Database deletion failed', {
          error: dbError,
          fileId
        })
        toast.error('Failed to delete file record')
        return
      }

      // 4. Update local state
      dispatch({ type: 'DELETE_FILE', fileId })

      toast.success(`Deleted ${file.name}`)
      announce(`Deleted ${file.name}`, 'polite')

      logger.info('File deleted successfully', {
        fileId,
        fileName: file.name
      })

    } catch (error) {
      logger.error('Deletion error', {
        error,
        fileId
      })
      toast.error('Failed to delete file')
      announce('Failed to delete file', 'assertive')
    }
  }

  const handleBulkDelete = async () => {
    if (state.selectedFiles.length === 0) {
      logger.warn('Bulk delete validation failed', { reason: 'No files selected' })
      toast.error('No files selected')
      return
    }

    const filesToDelete = state.files.filter(f => state.selectedFiles.includes(f.id))
    const fileNames = filesToDelete.map(f => f.name)
    const totalSize = filesToDelete.reduce((sum, f) => sum + f.size, 0)

    logger.info('Bulk delete initiated in Supabase', {
      fileCount: state.selectedFiles.length,
      fileNames: fileNames.slice(0, 5),
      totalSize
    })

    try {
      setIsSaving(true)

      // Dynamic import
      const { bulkDeleteFiles } = await import('@/lib/files-hub-queries')

      const { error } = await bulkDeleteFiles(state.selectedFiles)

      if (error) throw new Error(error.message)

      state.selectedFiles.forEach(fileId => {
        dispatch({ type: 'DELETE_FILE', fileId })
      })

      dispatch({ type: 'CLEAR_SELECTED_FILES' })

      logger.info('Bulk delete completed', {
        deletedCount: filesToDelete.length,
        totalSize
      })

      toast.success(`${filesToDelete.length} files deleted - ${Math.round(totalSize / 1024)}KB removed`)
    } catch (error: any) {
      logger.error('Bulk delete failed', {
        error: error.message,
        fileCount: state.selectedFiles.length
      })
      toast.error('Failed to delete files', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async (fileId: string) => {
    if (!userId) {
      toast.error('Please log in to download files')
      return
    }

    const file = state.files.find(f => f.id === fileId)
    if (!file) {
      logger.warn('Download failed - file not found', { fileId })
      return
    }

    try {
      logger.info('Downloading file', {
        fileId: file.id,
        fileName: file.name
      })

      // 1. Get file details from database to get storage_path
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('storage_path, storage_provider')
        .eq('id', fileId)
        .single()

      if (fetchError) {
        logger.error('Failed to fetch file details', { error: fetchError, fileId })
        toast.error('Failed to download file')
        return
      }

      // 2. Download file from Supabase Storage
      if (fileData.storage_path && fileData.storage_provider === 'supabase') {
        const { data, error } = await supabase
          .storage
          .from('user-files')
          .download(fileData.storage_path)

        if (error) {
          logger.error('Download failed', {
            error,
            fileId: file.id
          })
          toast.error(`Failed to download ${file.name}`)
          announce(`Failed to download ${file.name}`, 'assertive')
          return
        }

        // 3. Create blob URL and trigger download
        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // 4. Increment download count in database
        await supabase
          .from('files')
          .update({ downloads: file.downloads + 1 })
          .eq('id', fileId)

        // 5. Update local state
        const updatedFile = { ...file, downloads: file.downloads + 1 }
        dispatch({ type: 'UPDATE_FILE', file: updatedFile })

        toast.success(`Downloaded ${file.name} - Size: ${formatFileSize(file.size)}`)

        announce(`Downloaded ${file.name}`, 'polite')

        logger.info('File downloaded successfully', {
          fileId: file.id,
          fileName: file.name
        })
      } else {
        // Fallback for files without storage_path (e.g., old files)
        const a = document.createElement('a')
        a.href = file.url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast.success(`Downloaded ${file.name}`)
        announce(`Downloaded ${file.name}`, 'polite')
      }

    } catch (error) {
      logger.error('Download error', {
        error,
        fileId: file.id
      })
      toast.error('Download failed')
      announce('Download failed', 'assertive')
    }
  }

  const handleShare = async () => {
    if (!state.selectedFile) {
      logger.warn('Share validation failed', { reason: 'No file selected' })
      return
    }

    if (!shareEmails.trim()) {
      logger.warn('Share validation failed', { reason: 'No email addresses provided' })
      toast.error('Email required', { description: 'Please enter at least one email address' })
      return
    }

    if (!userId) {
      toast.error('Please log in to share files')
      return
    }

    const emails = shareEmails.split(',').map(e => e.trim()).filter(e => e)

    logger.info('File share initiated', {
      fileId: state.selectedFile.id,
      fileName: state.selectedFile.name,
      recipientCount: emails.length,
      recipients: emails,
      userId
    })

    try {
      setIsSaving(true)

      // Dynamic import for code splitting
      const { updateFile } = await import('@/lib/files-hub-queries')

      const newSharedWith = [...(state.selectedFile.sharedWith || []), ...emails]
      const { error: shareError } = await updateFile(state.selectedFile.id, {
        shared: true,
        shared_with: newSharedWith
      })

      if (shareError) {
        throw new Error(shareError.message || 'Failed to share file')
      }

      const updatedFile = {
        ...state.selectedFile,
        shared: true,
        sharedWith: newSharedWith
      }

      dispatch({ type: 'UPDATE_FILE', file: updatedFile })
      setIsShareModalOpen(false)
      setShareEmails('')

      logger.info('File shared successfully to database', {
        fileId: state.selectedFile.id,
        fileName: state.selectedFile.name,
        recipientCount: emails.length,
        userId
      })

      toast.success(`File shared: ${state.selectedFile.name} - ${emails.length} recipient(s)`)
      announce('File shared successfully', 'polite')
    } catch (error: any) {
      logger.error('File share failed', {
        error: error.message,
        fileId: state.selectedFile.id,
        fileName: state.selectedFile.name,
        userId
      })
      toast.error('Failed to share file', {
        description: error.message || 'Please try again later'
      })
      announce('Error sharing file', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMove = async () => {
    if (!state.selectedFile || !moveToFolder) {
      logger.warn('Move validation failed', {
        reason: 'Missing file or folder',
        hasFile: !!state.selectedFile,
        hasFolder: !!moveToFolder
      })
      return
    }

    if (!userId) {
      toast.error('Please log in to move files')
      return
    }

    logger.info('Moving file', {
      fileId: state.selectedFile.id,
      fileName: state.selectedFile.name,
      fromFolder: state.selectedFile.folder,
      toFolder: moveToFolder,
      userId
    })

    try {
      setIsSaving(true)

      // Dynamic import for code splitting
      const { moveFileToFolder } = await import('@/lib/files-hub-queries')

      const { error: moveError } = await moveFileToFolder(state.selectedFile.id, moveToFolder)

      if (moveError) {
        throw new Error(moveError.message || 'Failed to move file')
      }

      const previousFolder = state.selectedFile.folder
      const updatedFile = { ...state.selectedFile, folder: moveToFolder }
      dispatch({ type: 'UPDATE_FILE', file: updatedFile })
      setIsMoveModalOpen(false)
      setMoveToFolder('')

      logger.info('File moved successfully to database', {
        fileId: state.selectedFile.id,
        fileName: state.selectedFile.name,
        fromFolder: previousFolder,
        toFolder: moveToFolder,
        userId
      })

      toast.success(`File moved: ${state.selectedFile.name} - ${previousFolder} to ${moveToFolder}`)
      announce('File moved successfully', 'polite')
    } catch (error: any) {
      logger.error('File move failed', {
        error: error.message,
        fileId: state.selectedFile.id,
        fileName: state.selectedFile.name,
        userId
      })
      toast.error('Failed to move file', {
        description: error.message || 'Please try again later'
      })
      announce('Error moving file', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStar = async (fileId: string) => {
    const file = state.files.find(f => f.id === fileId)

    if (!file) {
      logger.warn('Toggle star failed - file not found', { fileId })
      return
    }

    const newStarred = !file.starred

    logger.info(newStarred ? 'Starring file in Supabase' : 'Unstarring file in Supabase', {
      fileId,
      fileName: file.name,
      starred: newStarred
    })

    try {
      // Dynamic import
      const { toggleFileStar } = await import('@/lib/files-hub-queries')

      const { error } = await toggleFileStar(fileId, newStarred)

      if (error) throw new Error(error.message)

      dispatch({ type: 'TOGGLE_STAR', fileId })

      toast.success(newStarred ? `Added to favorites: ${file.name}` : `Removed from favorites: ${file.name}`)
    } catch (error: any) {
      logger.error('Toggle star failed', {
        error: error.message,
        fileId,
        fileName: file.name
      })
      toast.error('Failed to update favorite', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleViewFile = (file: FileItem) => {
    logger.info('Opening file view', {
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })

    const updatedFile = { ...file, views: file.views + 1 }
    dispatch({ type: 'UPDATE_FILE', file: updatedFile })
    dispatch({ type: 'SELECT_FILE', file: updatedFile })
    setIsViewModalOpen(true)

    logger.info('File view modal opened', {
      fileId: file.id,
      fileName: file.name,
      newViewCount: file.views + 1
    })
  }

  // ============================================================================
  // FILE DISPLAY HELPERS - Using imported utilities
  // ============================================================================
  // Helper functions now imported from @/lib/files-hub-utils:
  // - getFileIcon(type) - Returns icon component for file type
  // - getFileTypeColor(type) - Returns color class for file type
  // - formatFileSize(bytes) - Formats bytes to readable size
  // - formatDate(date) - Formats date to readable string

  const renderFileIcon = (type: FileItem['type']) => {
    const IconComponent = getFileIcon(type)
    return <IconComponent className="h-5 w-5" />
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isPageLoading) {
    return (
      <div className="h-full min-h-screen relative p-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="h-full min-h-screen relative p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (state.files.length === 0 && !isPageLoading) {
    return (
      <div className="h-full min-h-screen relative p-6">
        <NoDataEmptyState
          entityName="files"
          description="No files uploaded yet. Start by uploading your first file."
          action={{
            label: 'Upload File',
            onClick: () => setIsUploadModalOpen(true)
          }}
        />
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0" />
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0" />

      {/* Storage Onboarding Wizard */}
      <StorageOnboardingWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={handleOnboardingComplete}
      />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                <TextShimmer>Files Hub</TextShimmer>
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and organize your files efficiently
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsUploadModalOpen(true)} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              {state.selectedFiles.length > 0 && (
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({state.selectedFiles.length})
                </Button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScrollReveal delay={0.1}>
            <LiquidGlassCard className="p-4 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold mt-1">
                    <NumberFlow value={stats.total} />
                  </p>
                </div>
                <File className="h-8 w-8 text-blue-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <LiquidGlassCard className="p-4 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-cyan-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <LiquidGlassCard className="p-4 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold mt-1">
                    <NumberFlow value={stats.totalDownloads} />
                  </p>
                </div>
                <Download className="h-8 w-8 text-green-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <LiquidGlassCard className="p-4 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold mt-1">
                    <NumberFlow value={stats.totalViews} />
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>

        {/* MULTI-CLOUD STORAGE INTELLIGENCE - USER MANUAL SPEC */}
        <ScrollReveal delay={0.5}>
          <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Cloud className="w-6 h-6 text-green-600" />
                Multi-Cloud Storage Intelligence
              </CardTitle>
              <CardDescription>
                Save 70-80% on storage costs with intelligent file routing across Supabase and Wasabi S3
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cost Savings Comparison */}
              <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Your Monthly Savings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Traditional Storage Cost */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Traditional Storage</span>
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400">
                        Standard
                      </Badge>
                    </div>
                    <div className="h-24 bg-gradient-to-t from-red-500 to-red-400 rounded-lg flex items-end justify-center pb-2">
                      <span className="text-2xl font-bold text-white">$125</span>
                    </div>
                    <p className="text-xs text-center text-gray-500">Industry average</p>
                  </div>

                  {/* Your Hybrid Cost */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Your Hybrid Cost</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                        Optimized
                      </Badge>
                    </div>
                    <div className="h-24 bg-gradient-to-t from-green-600 to-green-500 rounded-lg flex items-end justify-center pb-2 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: [-100, 200] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="text-2xl font-bold text-white relative z-10">$28</span>
                    </div>
                    <p className="text-xs text-center text-green-600 font-semibold">Multi-cloud savings</p>
                  </div>

                  {/* Savings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">You Save</span>
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        78%
                      </Badge>
                    </div>
                    <div className="h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg flex flex-col items-center justify-center border-2 border-green-300 dark:border-green-700">
                      <span className="text-3xl font-bold text-green-700 dark:text-green-400">
                        <NumberFlow value={97} />
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-500 font-medium">$/month saved</span>
                    </div>
                    <p className="text-xs text-center text-gray-500">$1,164/year</p>
                  </div>
                </div>
              </div>

              {/* Storage Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supabase Storage */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Supabase Storage</h4>
                      <p className="text-xs text-gray-500">Fast access for active files</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Files</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        <NumberFlow value={142} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">2.4 GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">$18</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500">
                        <FileCheck className="w-3 h-3 inline mr-1" />
                        Recently accessed files, active projects
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wasabi S3 Storage */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Wasabi S3</h4>
                      <p className="text-xs text-gray-500">Cost-effective archives</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Files</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        <NumberFlow value={287} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">18.7 GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">$10</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500">
                        <FileArchive className="w-3 h-3 inline mr-1" />
                        Long-term archives, large video files
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Benefits */}
              <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Multi-Cloud Storage Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">70-80% Cost Savings</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Save thousands annually with intelligent file routing
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Intelligent Routing</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Files automatically placed in optimal storage tier
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Copy className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Redundant Backups</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Your files protected across multiple cloud providers
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Enterprise Security</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Bank-level encryption and access controls
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  How Intelligent Routing Works
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Active files</strong> (accessed in last 30 days) automatically stored in <strong>Supabase</strong> for fast access
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Archive files</strong> (older than 30 days or large files) moved to <strong>Wasabi S3</strong> for cost savings
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Smart optimization</strong> runs daily to ensure files are in the most cost-effective location
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* CLOUD STORAGE PROVIDERS - Real OAuth Integration */}
        <ScrollReveal delay={0.6}>
          <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 border-blue-200 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-sky-950/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Cloud className="w-7 h-7 text-blue-600" />
                    Cloud Storage Integration
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Connect Google Drive, Dropbox, OneDrive, and more to access all your files in one unified interface
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWizard(true)}
                  className="gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  Setup Wizard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="providers" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="providers">Providers</TabsTrigger>
                  <TabsTrigger value="files">All Files</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="providers" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <StorageProvidersCard />
                    </div>
                    <div>
                      <StorageQuotaCard />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="files">
                  <UnifiedFileBrowser />
                </TabsContent>

                <TabsContent value="activity">
                  <StorageActivityLog />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Filters and Controls */}
        <ScrollReveal>
          <LiquidGlassCard className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
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

              {/* Filter by Type */}
              <Select value={state.filterType} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER', filterType: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={state.sortBy} onValueChange={(value: any) => dispatch({ type: 'SET_SORT', sortBy: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex gap-2">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'grid' })}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'list' })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Files Grid/List */}
        <ScrollReveal>
          <LiquidGlassCard className="p-6">
            {filteredAndSortedFiles.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
                {filteredAndSortedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {state.viewMode === 'grid' ? (
                      <Card className="group hover:shadow-lg transition-all cursor-pointer border-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Checkbox
                              checked={state.selectedFiles.includes(file.id)}
                              onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: file.id })}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleStar(file.id)
                                }}
                              >
                                <Star className={`h-4 w-4 ${file.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                              </Button>
                            </div>
                          </div>

                          <div
                            className="flex flex-col items-center text-center mb-3"
                            onClick={() => handleViewFile(file)}
                          >
                            <div className={`mb-2 ${getFileTypeColor(file.type)}`}>
                              {renderFileIcon(file.type)}
                            </div>
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{file.name}</h4>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {file.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {file.downloads}
                            </span>
                          </div>

                          <div className="flex gap-1 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(file.id)
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                dispatch({ type: 'SELECT_FILE', file })
                                setIsShareModalOpen(true)
                              }}
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteFile(file.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="group hover:shadow-md transition-all cursor-pointer border-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={state.selectedFiles.includes(file.id)}
                              onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: file.id })}
                            />

                            <div className={getFileTypeColor(file.type)}>
                              {renderFileIcon(file.type)}
                            </div>

                            <div className="flex-1 min-w-0" onClick={() => handleViewFile(file)}>
                              <h4 className="font-medium text-sm truncate">{file.name}</h4>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{formatDate(file.uploadedAt)}</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {file.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  {file.downloads}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {file.starred && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                              {file.shared && <Share2 className="h-4 w-4 text-blue-500" />}
                              {file.locked && <Lock className="h-4 w-4 text-red-500" />}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(file.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  dispatch({ type: 'SELECT_FILE', file })
                                  setIsShareModalOpen(true)
                                }}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </LiquidGlassCard>
        </ScrollReveal>
      </div>

      {/* MODALS */}

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Select files to upload to your Files Hub
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
              {uploadFiles && uploadFiles.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {uploadFiles.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUploadFiles} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View File Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{state.selectedFile?.name}</DialogTitle>
            <DialogDescription>
              File details and information
            </DialogDescription>
          </DialogHeader>

          {state.selectedFile && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>File Name</Label>
                    <p className="text-sm mt-1">{state.selectedFile.name}</p>
                  </div>
                  <div>
                    <Label>File Type</Label>
                    <p className="text-sm mt-1 capitalize">{state.selectedFile.type}</p>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <p className="text-sm mt-1">{formatFileSize(state.selectedFile.size)}</p>
                  </div>
                  <div>
                    <Label>Extension</Label>
                    <p className="text-sm mt-1">.{state.selectedFile.extension}</p>
                  </div>
                  <div>
                    <Label>Uploaded By</Label>
                    <p className="text-sm mt-1">{state.selectedFile.uploadedBy.name}</p>
                  </div>
                  <div>
                    <Label>Upload Date</Label>
                    <p className="text-sm mt-1">{formatDate(state.selectedFile.uploadedAt)}</p>
                  </div>
                  <div>
                    <Label>Folder</Label>
                    <p className="text-sm mt-1">{state.selectedFile.folder}</p>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <p className="text-sm mt-1">v{state.selectedFile.version}</p>
                  </div>
                  <div>
                    <Label>Downloads</Label>
                    <p className="text-sm mt-1">{state.selectedFile.downloads}</p>
                  </div>
                  <div>
                    <Label>Views</Label>
                    <p className="text-sm mt-1">{state.selectedFile.views}</p>
                  </div>
                  <div>
                    <Label>Access Level</Label>
                    <p className="text-sm mt-1 capitalize">{state.selectedFile.accessLevel}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex gap-2 mt-1">
                      {state.selectedFile.starred && <Badge variant="secondary">Starred</Badge>}
                      {state.selectedFile.shared && <Badge variant="secondary">Shared</Badge>}
                      {state.selectedFile.locked && <Badge variant="destructive">Locked</Badge>}
                    </div>
                  </div>
                </div>

                {state.selectedFile.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mt-2">
                      {state.selectedFile.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>File uploaded</p>
                      <p className="text-xs text-muted-foreground">{formatDate(state.selectedFile.uploadedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{state.selectedFile.views} views</p>
                      <p className="text-xs text-muted-foreground">Last viewed recently</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{state.selectedFile.downloads} downloads</p>
                      <p className="text-xs text-muted-foreground">Last downloaded recently</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="versions" className="space-y-4">
                <div className="space-y-3">
                  {[...Array(state.selectedFile.version)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Version {state.selectedFile.version - i}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(new Date(state.selectedFile.uploadedAt).getTime() - i * 7 * 24 * 60 * 60 * 1000).toISOString())}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
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
              <Label>Email Addresses</Label>
              <Textarea
                placeholder="Enter email addresses separated by commas"
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Access Level</Label>
              <Select defaultValue="view">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="download">Can download</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSaving}>
              {isSaving ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Modal */}
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move File</DialogTitle>
            <DialogDescription>
              Move {state.selectedFile?.name} to a different folder
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Folder</Label>
              <Select value={moveToFolder} onValueChange={setMoveToFolder}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Documents">Documents</SelectItem>
                  <SelectItem value="Images">Images</SelectItem>
                  <SelectItem value="Videos">Videos</SelectItem>
                  <SelectItem value="Downloads">Downloads</SelectItem>
                  <SelectItem value="Projects">Projects</SelectItem>
                  <SelectItem value="Designs">Designs</SelectItem>
                  <SelectItem value="Archive">Archive</SelectItem>
                  <SelectItem value="Shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={isSaving}>
              {isSaving ? 'Moving...' : 'Move'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
