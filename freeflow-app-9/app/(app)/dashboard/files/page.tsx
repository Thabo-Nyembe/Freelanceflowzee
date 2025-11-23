"use client"

import React, { useState, useEffect, useReducer, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { toast } from 'sonner'
import {
  File,
  FolderOpen,
  Upload,
  Download,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Star,
  Share2,
  Eye,
  Archive,
  FileText,
  Image,
  Video,
  FileCode,
  FileSpreadsheet,
  HardDrive,
  Plus,
  Trash2,
  Edit,
  Copy,
  Move,
  Clock,
  Users,
  Lock,
  Unlock,
  Tag,
  Folder,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { NumberFlow } from '@/components/ui/number-flow'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Files')

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  logger.debug('FloatingParticle rendered', { color, delay })
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

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface FileItem {
  id: string
  name: string
  type: 'pdf' | 'figma' | 'folder' | 'video' | 'excel' | 'image' | 'archive' | 'word' | 'code'
  size: string
  sizeBytes: number
  dateModified: string
  owner: string
  folder: string
  starred: boolean
  shared: boolean
  thumbnail: string | null
  tags: string[]
  fileCount?: number
  locked: boolean
  description?: string
}

interface FilesState {
  files: FileItem[]
  selectedFile: FileItem | null
  viewMode: 'grid' | 'list'
  selectedFolder: string
  searchTerm: string
  sortBy: 'name' | 'date' | 'size' | 'type'
  selectedFiles: string[]
}

type FilesAction =
  | { type: 'SET_FILES'; files: FileItem[] }
  | { type: 'ADD_FILE'; file: FileItem }
  | { type: 'UPDATE_FILE'; file: FileItem }
  | { type: 'DELETE_FILE'; fileId: string }
  | { type: 'SELECT_FILE'; file: FileItem | null }
  | { type: 'SET_VIEW_MODE'; viewMode: 'grid' | 'list' }
  | { type: 'SET_FOLDER'; folder: string }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_SORT'; sortBy: FilesState['sortBy'] }
  | { type: 'TOGGLE_SELECT_FILE'; fileId: string }
  | { type: 'CLEAR_SELECTED_FILES' }
  | { type: 'TOGGLE_STAR'; fileId: string }

// ============================================================================
// REDUCER
// ============================================================================

function filesReducer(state: FilesState, action: FilesAction): FilesState {
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

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'SET_FOLDER':
      logger.debug('Folder changed', { folder: action.folder })
      return { ...state, selectedFolder: action.folder }

    case 'SET_SEARCH':
      logger.debug('Search term changed', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_SORT':
      logger.debug('Sort changed', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

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
      logger.debug('Clearing all selected files')
      return { ...state, selectedFiles: [] }

    case 'TOGGLE_STAR':
      logger.debug('Toggle star', { fileId: action.fileId })
      return {
        ...state,
        files: state.files.map(f =>
          f.id === action.fileId ? { ...f, starred: !f.starred } : f
        )
      }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateMockFiles = (): FileItem[] => {
  logger.debug('Generating mock file data')

  const fileTypes: Array<FileItem['type']> = ['pdf', 'excel', 'word', 'image', 'video', 'archive', 'code', 'figma']
  const folders = ['Documents', 'Images', 'Videos', 'Design', 'Code', 'Archives']
  const owners = ['Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Kim', 'Lisa Brown', 'Alex Rivera']

  const files: FileItem[] = []

  for (let i = 1; i <= 50; i++) {
    const type = fileTypes[Math.floor(Math.random() * fileTypes.length)]
    const folder = folders[Math.floor(Math.random() * folders.length)]
    const owner = owners[Math.floor(Math.random() * owners.length)]
    const sizeBytes = Math.floor(Math.random() * 100000000) + 10000 // 10KB to 100MB
    const sizeInMB = sizeBytes / (1024 * 1024)
    const size = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${(sizeInMB * 1024).toFixed(0)} KB`

    files.push({
      id: `F-${String(i).padStart(3, '0')}`,
      name: `${folder} File ${i}.${type}`,
      type,
      size,
      sizeBytes,
      dateModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner,
      folder,
      starred: Math.random() > 0.8,
      shared: Math.random() > 0.6,
      thumbnail: (type === 'image' || type === 'video') ? `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop` : null,
      tags: ['tag' + (i % 5), 'project' + (i % 3)],
      locked: Math.random() > 0.9,
      description: Math.random() > 0.7 ? `This is a ${type} file` : undefined
    })
  }

  logger.info('Generated mock files', { count: files.length })
  return files
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FilesPage() {
  logger.debug('Component mounting')

  // A+++ ANNOUNCER
  const { announce } = useAnnouncer()

  // REDUCER STATE
  const [state, dispatch] = useReducer(filesReducer, {
    files: [],
    selectedFile: null,
    viewMode: 'grid',
    selectedFolder: 'all',
    searchTerm: '',
    sortBy: 'date',
    selectedFiles: []
  })

  // LOCAL STATE
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // MODAL STATES
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)

  // FORM DATA
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [shareEmails, setShareEmails] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [moveToFolder, setMoveToFolder] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    const loadFilesData = async () => {
      logger.info('Loading files from API')
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/files')
        const result = await response.json()

        if (result.success) {
          // Use mock data for now since API returns minimal data
          const mockFiles = generateMockFiles()
          dispatch({ type: 'SET_FILES', files: mockFiles })

          logger.info('Files loaded successfully from API', { count: result.files?.length || 0 })
          announce('Files loaded successfully', 'polite')
        } else {
          throw new Error(result.error || 'Failed to load files')
        }

        setIsLoading(false)
      } catch (err) {
        logger.error('Files load error', {
          error: err instanceof Error ? err.message : 'Unknown error',
          errorObject: err
        })
        setError(err instanceof Error ? err.message : 'Failed to load files')
        setIsLoading(false)
        announce('Error loading files', 'assertive')
      }
    }

    loadFilesData()
  }, [announce])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const folders = useMemo(() => {
    const folderList = [
      { name: 'all', label: 'All Files', count: state.files.length, icon: File },
      { name: 'Documents', label: 'Documents', count: state.files.filter(f => f.folder === 'Documents').length, icon: FileText },
      { name: 'Images', label: 'Images', count: state.files.filter(f => f.folder === 'Images').length, icon: Image },
      { name: 'Videos', label: 'Videos', count: state.files.filter(f => f.folder === 'Videos').length, icon: Video },
      { name: 'Design', label: 'Design', count: state.files.filter(f => f.folder === 'Design').length, icon: FileCode },
      { name: 'Code', label: 'Code', count: state.files.filter(f => f.folder === 'Code').length, icon: FileCode },
      { name: 'starred', label: 'Starred', count: state.files.filter(f => f.starred).length, icon: Star },
      { name: 'shared', label: 'Shared', count: state.files.filter(f => f.shared).length, icon: Share2 }
    ]
    logger.debug('Calculated folder counts')
    return folderList
  }, [state.files])

  const stats = useMemo(() => {
    const totalSizeBytes = state.files.reduce((sum, f) => sum + f.sizeBytes, 0)
    const totalSizeMB = totalSizeBytes / (1024 * 1024)
    const storageTotal = 100 * 1024 // 100 GB in MB
    const storageUsed = (totalSizeMB / storageTotal) * 100

    const s = {
      total: state.files.length,
      totalSize: totalSizeMB.toFixed(1),
      storageUsed: Math.min(storageUsed, 100).toFixed(0),
      shared: state.files.filter(f => f.shared).length,
      starred: state.files.filter(f => f.starred).length
    }
    logger.debug('Stats calculated', s)
    return s
  }, [state.files])

  const filteredAndSortedFiles = useMemo(() => {
    logger.debug('Filtering and sorting files', {
      searchTerm: state.searchTerm,
      selectedFolder: state.selectedFolder,
      sortBy: state.sortBy
    })

    let filtered = state.files

    // Filter by folder
    if (state.selectedFolder !== 'all') {
      if (state.selectedFolder === 'starred') {
        filtered = filtered.filter(f => f.starred)
      } else if (state.selectedFolder === 'shared') {
        filtered = filtered.filter(f => f.shared)
      } else {
        filtered = filtered.filter(f => f.folder === state.selectedFolder)
      }
      logger.debug('Folder filtered', { resultCount: filtered.length })
    }

    // Filter by search
    if (state.searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        f.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
      logger.debug('Search filtered', { resultCount: filtered.length })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
        case 'size':
          return b.sizeBytes - a.sizeBytes
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    logger.debug('Filtering and sorting complete', { resultCount: sorted.length })
    return sorted
  }, [state.files, state.selectedFolder, state.searchTerm, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleUploadFiles = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      logger.warn('No files selected for upload')
      toast.error('No files selected')
      return
    }

    const totalSize = Array.from(uploadFiles).reduce((sum, f) => sum + f.size, 0)
    const uploadedFileNames: string[] = []

    logger.info('Uploading files', { count: uploadFiles.length, totalSize })

    try {
      setIsSaving(true)

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        logger.debug(`Processing file ${i + 1}/${uploadFiles.length}`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })

        const response = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload-file',
            data: {
              name: file.name,
              type: file.type,
              size: file.size,
              parentFolder: 'Documents',
              tags: []
            }
          })
        })

        const result = await response.json()

        if (result.success && result.file) {
          const newFile: FileItem = {
            id: result.file.id,
            name: result.file.name,
            type: 'pdf', // simplified
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            sizeBytes: file.size,
            dateModified: new Date().toISOString().split('T')[0],
            owner: 'Current User',
            folder: 'Documents',
            starred: false,
            shared: false,
            thumbnail: null,
            tags: [],
            locked: false
          }

          dispatch({ type: 'ADD_FILE', file: newFile })
          uploadedFileNames.push(file.name)
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      }

      setIsUploadModalOpen(false)
      setUploadFiles(null)

      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1)
      logger.info('Upload complete', { count: uploadFiles.length, totalSize })

      toast.success(`Uploaded ${uploadFiles.length} file(s)`, {
        description: `${totalSizeMB} MB - Documents - Files: ${uploadedFileNames.slice(0, 3).join(', ')}${uploadedFileNames.length > 3 ? ` +${uploadedFileNames.length - 3} more` : ''}`
      })
    } catch (error: any) {
      logger.error('Upload failed', { error: error.message, count: uploadFiles.length })
      toast.error('Failed to upload files', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    const file = state.files.find(f => f.id === fileId)
    logger.info('Deleting file', { fileId, fileName: file?.name, fileSize: file?.size })

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-files',
          data: {
            fileIds: [fileId],
            permanent: false
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'DELETE_FILE', fileId })

        logger.info('File deleted successfully', { fileId, fileName: file?.name })

        toast.success('File deleted', {
          description: `${file?.name} - ${file?.size} - ${file?.folder} - ${result.undoAvailable ? 'Can be restored from trash' : 'Permanently deleted'}`
        })
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error: any) {
      logger.error('Delete failed', { error: error.message, fileId, fileName: file?.name })
      toast.error('Failed to delete file', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleBulkDelete = async () => {
    if (state.selectedFiles.length === 0) {
      toast.error('No files selected')
      return
    }

    const selectedFilesData = state.files.filter(f => state.selectedFiles.includes(f.id))
    const totalSize = selectedFilesData.reduce((sum, f) => sum + f.sizeBytes, 0)
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1)

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
          data: {
            fileIds: state.selectedFiles,
            permanent: false
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        state.selectedFiles.forEach(fileId => {
          dispatch({ type: 'DELETE_FILE', fileId })
        })

        dispatch({ type: 'CLEAR_SELECTED_FILES' })

        logger.info('Bulk delete successful', {
          deletedCount: result.fileCount || state.selectedFiles.length
        })

        toast.success(`Deleted ${result.fileCount || state.selectedFiles.length} file(s)`, {
          description: `${totalSizeMB} MB freed - ${selectedFilesData.slice(0, 3).map(f => f.name).join(', ')}${selectedFilesData.length > 3 ? ` +${selectedFilesData.length - 3} more` : ''} - ${result.undoAvailable ? `Restorable for ${result.undoExpires}` : 'Permanent'}`
        })
      } else {
        throw new Error(result.error || 'Bulk delete failed')
      }
    } catch (error: any) {
      logger.error('Bulk delete failed', { error: error.message, count: state.selectedFiles.length })
      toast.error('Failed to delete files', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStar = (fileId: string) => {
    const file = state.files.find(f => f.id === fileId)

    logger.info(file?.starred ? 'Unstarring file' : 'Starring file', {
      fileId,
      fileName: file?.name
    })

    dispatch({ type: 'TOGGLE_STAR', fileId })

    toast.success(file?.starred ? 'Removed from favorites' : 'Added to favorites', {
      description: `${file?.name} - ${file?.size} - ${file?.folder}`
    })
  }

  const handleRenameFile = async () => {
    if (!state.selectedFile || !newFileName) {
      logger.warn('Missing file or name for rename')
      return
    }

    logger.info('Renaming file', {
      oldName: state.selectedFile.name,
      newName: newFileName,
      fileId: state.selectedFile.id
    })

    try {
      setIsSaving(true)

      // Note: API doesn't have rename endpoint, using local state update
      // In production, this would be: POST /api/files with action 'update-file'
      const updatedFile = { ...state.selectedFile, name: newFileName }
      dispatch({ type: 'UPDATE_FILE', file: updatedFile })

      setIsRenameModalOpen(false)
      setNewFileName('')

      logger.info('Rename successful', {
        oldName: state.selectedFile.name,
        newName: newFileName
      })

      toast.success('File renamed', {
        description: `${state.selectedFile.name} → ${newFileName} - ${state.selectedFile.size} - ${state.selectedFile.folder}`
      })
    } catch (error: any) {
      logger.error('Rename failed', {
        error: error.message,
        fileName: state.selectedFile?.name
      })
      toast.error('Failed to rename file', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveFile = async () => {
    if (!state.selectedFile || !moveToFolder) {
      logger.warn('Missing file or folder for move')
      return
    }

    logger.info('Moving file', {
      fileName: state.selectedFile.name,
      fromFolder: state.selectedFile.folder,
      toFolder: moveToFolder
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
            targetFolder: moveToFolder
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const updatedFile = { ...state.selectedFile, folder: moveToFolder }
        dispatch({ type: 'UPDATE_FILE', file: updatedFile })

        setIsMoveModalOpen(false)
        setMoveToFolder('')

        logger.info('Move successful', {
          fileName: state.selectedFile.name,
          fromFolder: state.selectedFile.folder,
          toFolder: moveToFolder
        })

        toast.success(`Moved to ${moveToFolder}`, {
          description: `${state.selectedFile.name} - ${state.selectedFile.size} - From: ${state.selectedFile.folder} → To: ${moveToFolder}`
        })
      } else {
        throw new Error(result.error || 'Move failed')
      }
    } catch (error: any) {
      logger.error('Move failed', {
        error: error.message,
        fileName: state.selectedFile?.name
      })
      toast.error('Failed to move file', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareFile = async () => {
    if (!state.selectedFile || !shareEmails) {
      logger.warn('Missing file or emails for share')
      return
    }

    const recipients = shareEmails.split(',').map(email => email.trim())

    logger.info('Sharing file', {
      fileName: state.selectedFile.name,
      recipients,
      recipientCount: recipients.length
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
            recipients,
            permissions: 'view',
            expiresIn: '30 days'
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const updatedFile = { ...state.selectedFile, shared: true }
        dispatch({ type: 'UPDATE_FILE', file: updatedFile })

        setIsShareModalOpen(false)
        setShareEmails('')

        logger.info('Share successful', {
          fileName: state.selectedFile.name,
          recipientCount: recipients.length,
          shareUrl: result.shareUrl
        })

        toast.success('File shared', {
          description: `${state.selectedFile.name} - ${state.selectedFile.size} - Shared with: ${recipients.slice(0, 2).join(', ')}${recipients.length > 2 ? ` +${recipients.length - 2} more` : ''} - Expires: ${result.expiresIn || '30 days'}`
        })
      } else {
        throw new Error(result.error || 'Share failed')
      }
    } catch (error: any) {
      logger.error('Share failed', {
        error: error.message,
        fileName: state.selectedFile?.name
      })
      toast.error('Failed to share file', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />
      case 'figma': return <FileCode className="h-8 w-8 text-purple-500" />
      case 'folder': return <FolderOpen className="h-8 w-8 text-blue-500" />
      case 'video': return <Video className="h-8 w-8 text-green-500" />
      case 'excel': return <FileSpreadsheet className="h-8 w-8 text-green-600" />
      case 'image': return <Image className="h-8 w-8 text-orange-500" />
      case 'archive': return <Archive className="h-8 w-8 text-gray-500" />
      case 'word': return <FileText className="h-8 w-8 text-blue-600" />
      case 'code': return <FileCode className="h-8 w-8 text-cyan-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    logger.debug('Rendering loading state')
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CardSkeleton />
        <DashboardSkeleton />
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    logger.error('Rendering error state', { error })
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  logger.debug('Rendering main UI', {
    totalFiles: state.files.length,
    filteredFiles: filteredAndSortedFiles.length,
    viewMode: state.viewMode,
    selectedFolder: state.selectedFolder
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              <TextShimmer>Files</TextShimmer>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and organize your project files</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: state.viewMode === 'grid' ? 'list' : 'grid' })}>
              {state.viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
              {state.viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            {state.selectedFiles.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({state.selectedFiles.length})
              </Button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold mt-1">{stats.storageUsed}%</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                  <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${stats.storageUsed}%` }}></div>
                </div>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <LiquidGlassCard className="p-4 relative overflow-hidden">
            
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shared Files</p>
                <p className="text-2xl font-bold mt-1">
                  <NumberFlow value={stats.shared} />
                </p>
              </div>
              <Share2 className="h-8 w-8 text-green-500" />
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <LiquidGlassCard className="p-4 relative overflow-hidden">
            
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Starred Files</p>
                <p className="text-2xl font-bold mt-1">
                  <NumberFlow value={stats.starred} />
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </LiquidGlassCard>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <ScrollReveal>
            <LiquidGlassCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Folders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {folders.map((folder) => {
                    const IconComponent = folder.icon
                    return (
                      <button
                        key={folder.name}
                        onClick={() => dispatch({ type: 'SET_FOLDER', folder: folder.name })}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          state.selectedFolder === folder.name
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm">{folder.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {folder.count}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </div>
              </CardContent>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>

        {/* Files Content */}
        <div className="lg:col-span-3">
          <ScrollReveal>
            <LiquidGlassCard>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Files</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        value={state.searchTerm}
                        onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    <Select value={state.sortBy} onValueChange={(value: any) => dispatch({ type: 'SET_SORT', sortBy: value })}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {state.viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group cursor-pointer hover:shadow-lg transition-all border-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <Checkbox
                                checked={state.selectedFiles.includes(file.id)}
                                onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: file.id })}
                              />
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStar(file.id)}
                                >
                                  <Star className={`h-4 w-4 ${file.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-col items-center text-center mb-3" onClick={() => {
                              dispatch({ type: 'SELECT_FILE', file })
                              setIsViewModalOpen(true)
                            }}>
                              {file.thumbnail ? (
                                <img
                                  src={file.thumbnail}
                                  alt={file.name}
                                  className="w-16 h-16 rounded object-cover mb-2"
                                />
                              ) : (
                                <div className="mb-2">{getFileIcon(file.type)}</div>
                              )}
                              <h3 className="font-medium text-sm line-clamp-2 mb-1">{file.name}</h3>
                              <p className="text-xs text-muted-foreground">{file.size}</p>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex justify-between">
                                <span>{file.owner}</span>
                                <span>{file.dateModified}</span>
                              </div>
                            </div>

                            <div className="flex gap-1 mt-3">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                                dispatch({ type: 'SELECT_FILE', file })
                                setIsViewModalOpen(true)
                              }}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDeleteFile(file.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAndSortedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                        <Checkbox
                          checked={state.selectedFiles.includes(file.id)}
                          onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_FILE', fileId: file.id })}
                        />
                        <div className="flex items-center gap-3">
                          {file.thumbnail ? (
                            <img
                              src={file.thumbnail}
                              alt={file.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 flex items-center justify-center">
                              {getFileIcon(file.type)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium">{file.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              {file.folder} • {file.owner}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1" />
                        <div className="text-sm text-muted-foreground">
                          {file.size}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {file.dateModified}
                        </div>
                        <div className="flex items-center gap-1">
                          {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {file.shared && <Share2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" onClick={() => {
                            dispatch({ type: 'SELECT_FILE', file })
                            setIsViewModalOpen(true)
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteFile(file.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredAndSortedFiles.length === 0 && (
                  <div className="text-center py-12">
                    <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No files found</p>
                  </div>
                )}
              </CardContent>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>
      </div>

      {/* MODALS */}

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Select files to upload to your workspace
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
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadFiles} disabled={isSaving}>
              {isSaving ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View File Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{state.selectedFile?.name}</DialogTitle>
            <DialogDescription>
              File details and information
            </DialogDescription>
          </DialogHeader>

          {state.selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>File Name</Label>
                  <p className="text-sm mt-1">{state.selectedFile.name}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm mt-1 capitalize">{state.selectedFile.type}</p>
                </div>
                <div>
                  <Label>Size</Label>
                  <p className="text-sm mt-1">{state.selectedFile.size}</p>
                </div>
                <div>
                  <Label>Date Modified</Label>
                  <p className="text-sm mt-1">{state.selectedFile.dateModified}</p>
                </div>
                <div>
                  <Label>Owner</Label>
                  <p className="text-sm mt-1">{state.selectedFile.owner}</p>
                </div>
                <div>
                  <Label>Folder</Label>
                  <p className="text-sm mt-1">{state.selectedFile.folder}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-1">
                    {state.selectedFile.starred && <Badge variant="secondary">Starred</Badge>}
                    {state.selectedFile.shared && <Badge variant="secondary">Shared</Badge>}
                    {state.selectedFile.locked && <Badge variant="destructive">Locked</Badge>}
                  </div>
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-1 mt-1">
                    {state.selectedFile.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsViewModalOpen(false)
                  setIsRenameModalOpen(true)
                  setNewFileName(state.selectedFile.name)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsViewModalOpen(false)
                  setIsMoveModalOpen(true)
                }}>
                  <Move className="h-4 w-4 mr-2" />
                  Move
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsViewModalOpen(false)
                  setIsShareModalOpen(true)
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleDeleteFile(state.selectedFile.id)
                  setIsViewModalOpen(false)
                }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Modal */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for {state.selectedFile?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>New Name</Label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile} disabled={isSaving}>
              {isSaving ? 'Renaming...' : 'Rename'}
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
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Code">Code</SelectItem>
                  <SelectItem value="Archives">Archives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveFile} disabled={isSaving}>
              {isSaving ? 'Moving...' : 'Move'}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareFile} disabled={isSaving}>
              {isSaving ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
