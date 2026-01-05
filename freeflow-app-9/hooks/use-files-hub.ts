'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'code' | 'other'
export type ViewMode = 'grid' | 'list' | 'details'
export type SortBy = 'name' | 'date' | 'size' | 'type'

export interface FileItem {
  id: string
  name: string
  type: FileType
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folderId?: string
  path: string
  isStarred: boolean
  isShared: boolean
  shareLink?: string
  permissions: FilePermission[]
  versions: FileVersion[]
  metadata?: Record<string, any>
  uploadedBy: string
  uploadedByName: string
  lastModifiedBy?: string
  lastModifiedByName?: string
  createdAt: string
  updatedAt: string
}

export interface FilePermission {
  userId?: string
  email?: string
  name: string
  access: 'view' | 'edit' | 'admin'
  addedAt: string
}

export interface FileVersion {
  id: string
  version: number
  size: number
  url: string
  uploadedBy: string
  uploadedByName: string
  createdAt: string
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  path: string
  color?: string
  fileCount: number
  totalSize: number
  isStarred: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

export interface StorageStats {
  totalStorage: number
  usedStorage: number
  fileCount: number
  folderCount: number
  filesByType: Record<string, { count: number; size: number }>
  recentActivity: { date: string; uploads: number; downloads: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFiles: FileItem[] = [
  { id: 'file-1', name: 'project-proposal.pdf', type: 'document', mimeType: 'application/pdf', size: 2500000, url: '/files/proposal.pdf', thumbnailUrl: '/thumbs/pdf.png', folderId: 'folder-1', path: '/Documents/project-proposal.pdf', isStarred: true, isShared: false, permissions: [], versions: [], uploadedBy: 'user-1', uploadedByName: 'Alex Chen', createdAt: '2024-03-15', updatedAt: '2024-03-18' },
  { id: 'file-2', name: 'brand-assets.zip', type: 'archive', mimeType: 'application/zip', size: 15000000, url: '/files/assets.zip', folderId: 'folder-2', path: '/Design/brand-assets.zip', isStarred: false, isShared: true, shareLink: 'https://share.example.com/abc123', permissions: [{ email: 'client@example.com', name: 'Client', access: 'view', addedAt: '2024-03-10' }], versions: [], uploadedBy: 'user-2', uploadedByName: 'Sarah Miller', createdAt: '2024-03-10', updatedAt: '2024-03-10' },
  { id: 'file-3', name: 'demo-video.mp4', type: 'video', mimeType: 'video/mp4', size: 150000000, url: '/files/demo.mp4', thumbnailUrl: '/thumbs/video-thumb.jpg', path: '/demo-video.mp4', isStarred: true, isShared: false, permissions: [], versions: [{ id: 'v1', version: 1, size: 145000000, url: '/files/demo-v1.mp4', uploadedBy: 'user-1', uploadedByName: 'Alex Chen', createdAt: '2024-03-01' }], uploadedBy: 'user-1', uploadedByName: 'Alex Chen', lastModifiedBy: 'user-2', lastModifiedByName: 'Sarah Miller', createdAt: '2024-03-01', updatedAt: '2024-03-15' },
  { id: 'file-4', name: 'logo.png', type: 'image', mimeType: 'image/png', size: 250000, url: '/files/logo.png', thumbnailUrl: '/files/logo.png', folderId: 'folder-2', path: '/Design/logo.png', isStarred: false, isShared: false, permissions: [], versions: [], uploadedBy: 'user-2', uploadedByName: 'Sarah Miller', createdAt: '2024-02-20', updatedAt: '2024-02-20' }
]

const mockFolders: Folder[] = [
  { id: 'folder-1', name: 'Documents', path: '/Documents', color: '#3b82f6', fileCount: 15, totalSize: 25000000, isStarred: false, createdBy: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-03-18' },
  { id: 'folder-2', name: 'Design', path: '/Design', color: '#22c55e', fileCount: 28, totalSize: 180000000, isStarred: true, createdBy: 'user-2', createdAt: '2024-01-01', updatedAt: '2024-03-15' },
  { id: 'folder-3', name: 'Archive', path: '/Archive', color: '#6b7280', fileCount: 45, totalSize: 500000000, isStarred: false, createdBy: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-02-28' }
]

const mockStats: StorageStats = {
  totalStorage: 10737418240,
  usedStorage: 1250000000,
  fileCount: 156,
  folderCount: 12,
  filesByType: {
    document: { count: 45, size: 150000000 },
    image: { count: 38, size: 200000000 },
    video: { count: 12, size: 600000000 },
    archive: { count: 8, size: 250000000 },
    other: { count: 53, size: 50000000 }
  },
  recentActivity: [
    { date: '2024-03-18', uploads: 5, downloads: 12 },
    { date: '2024-03-19', uploads: 8, downloads: 15 },
    { date: '2024-03-20', uploads: 3, downloads: 8 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseFilesHubOptions {
  
  folderId?: string
}

export function useFilesHub(options: UseFilesHubOptions = {}) {
  const {  folderId } = options

  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const uploadQueueRef = useRef<File[]>([])

  const fetchFiles = useCallback(async (filters?: { folderId?: string; type?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.folderId || folderId) params.set('folderId', filters?.folderId || folderId || '')
      if (filters?.type) params.set('type', filters.type)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/files?${params}`)
      const result = await response.json()
      if (result.success) {
        setFiles(Array.isArray(result.files) ? result.files : [])
        setFolders(Array.isArray(result.folders) ? result.folders : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.files
      }
      setFiles([])
      setFolders(mockFolders)
      setStats(null)
      return []
    } catch (err) {
      setFiles([])
      setFolders(mockFolders)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ folderId])

  const uploadFiles = useCallback(async (fileList: File[], targetFolderId?: string) => {
    const newUploads: UploadProgress[] = fileList.map((file, index) => ({
      fileId: `upload-${Date.now()}-${index}`,
      fileName: file.name,
      progress: 0,
      status: 'pending'
    }))
    setUploads(prev => [...prev, ...newUploads])

    const results: FileItem[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const uploadId = newUploads[i].fileId

      setUploads(prev => prev.map(u => u.fileId === uploadId ? { ...u, status: 'uploading' } : u))

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploads(prev => prev.map(u => u.fileId === uploadId ? { ...u, progress } : u))
        }

        const fileType = getFileType(file.type)
        const folder = folders.find(f => f.id === targetFolderId)
        const newFile: FileItem = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          mimeType: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          folderId: targetFolderId,
          path: folder ? `${folder.path}/${file.name}` : `/${file.name}`,
          isStarred: false,
          isShared: false,
          permissions: [],
          versions: [],
          uploadedBy: 'user-1',
          uploadedByName: 'You',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        results.push(newFile)
        setFiles(prev => [newFile, ...prev])
        setUploads(prev => prev.map(u => u.fileId === uploadId ? { ...u, status: 'complete', progress: 100 } : u))
      } catch (err) {
        setUploads(prev => prev.map(u => u.fileId === uploadId ? { ...u, status: 'error', error: 'Upload failed' } : u))
      }
    }

    // Clear completed uploads after delay
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status !== 'complete'))
    }, 3000)

    return { success: true, files: results }
  }, [folders])

  const getFileType = (mimeType: string): FileType => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document')) return 'document'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive'
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return 'code'
    return 'other'
  }

  const deleteFile = useCallback(async (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setSelectedItems(prev => { const next = new Set(prev); next.delete(fileId); return next })
    return { success: true }
  }, [])

  const deleteFiles = useCallback(async (fileIds: string[]) => {
    setFiles(prev => prev.filter(f => !fileIds.includes(f.id)))
    setSelectedItems(new Set())
    return { success: true }
  }, [])

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f))
    return { success: true }
  }, [])

  const moveFile = useCallback(async (fileId: string, targetFolderId: string) => {
    const folder = folders.find(f => f.id === targetFolderId)
    const file = files.find(f => f.id === fileId)
    if (file) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, folderId: targetFolderId, path: folder ? `${folder.path}/${file.name}` : `/${file.name}`, updatedAt: new Date().toISOString() } : f))
    }
    return { success: true }
  }, [files, folders])

  const copyFile = useCallback(async (fileId: string, targetFolderId?: string) => {
    const original = files.find(f => f.id === fileId)
    if (!original) return { success: false, error: 'File not found' }

    const folder = targetFolderId ? folders.find(f => f.id === targetFolderId) : null
    const copy: FileItem = {
      ...original,
      id: `file-${Date.now()}`,
      name: `Copy of ${original.name}`,
      folderId: targetFolderId,
      path: folder ? `${folder.path}/Copy of ${original.name}` : `/Copy of ${original.name}`,
      isStarred: false,
      isShared: false,
      shareLink: undefined,
      permissions: [],
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setFiles(prev => [copy, ...prev])
    return { success: true, file: copy }
  }, [files, folders])

  const toggleStar = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isStarred: !f.isStarred } : f))
    return { success: true }
  }, [])

  const shareFile = useCallback(async (fileId: string, permission: Omit<FilePermission, 'addedAt'>) => {
    const newPermission: FilePermission = { ...permission, addedAt: new Date().toISOString() }
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, permissions: [...f.permissions, newPermission], isShared: true } : f))
    return { success: true }
  }, [])

  const removeShare = useCallback(async (fileId: string, userId?: string, email?: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? {
      ...f,
      permissions: f.permissions.filter(p => !(p.userId === userId || p.email === email)),
      isShared: f.permissions.length > 1 || !!f.shareLink
    } : f))
    return { success: true }
  }, [])

  const createShareLink = useCallback(async (fileId: string): Promise<string> => {
    const shareLink = `https://share.example.com/${Date.now()}`
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, shareLink, isShared: true } : f))
    return shareLink
  }, [])

  const removeShareLink = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, shareLink: undefined, isShared: f.permissions.length > 0 } : f))
    return { success: true }
  }, [])

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    const parent = parentId ? folders.find(f => f.id === parentId) : null
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
      path: parent ? `${parent.path}/${name}` : `/${name}`,
      fileCount: 0,
      totalSize: 0,
      isStarred: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setFolders(prev => [...prev, newFolder])
    return { success: true, folder: newFolder }
  }, [folders])

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f))
    return { success: true }
  }, [])

  const deleteFolder = useCallback(async (folderId: string, deleteContents?: boolean) => {
    if (deleteContents) {
      setFiles(prev => prev.filter(f => f.folderId !== folderId))
    }
    setFolders(prev => prev.filter(f => f.id !== folderId))
    return { success: true }
  }, [])

  const toggleFolderStar = useCallback(async (folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isStarred: !f.isStarred } : f))
    return { success: true }
  }, [])

  const selectItem = useCallback((itemId: string, isMulti?: boolean) => {
    setSelectedItems(prev => {
      const next = new Set(isMulti ? prev : [])
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(files.map(f => f.id)))
  }, [files])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const downloadFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      window.open(file.url, '_blank')
    }
    return { success: true }
  }, [files])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchFiles({ search: query })
  }, [fetchFiles])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchFiles()
  }, [fetchFiles])

  useEffect(() => { refresh() }, [refresh])

  const sortedFiles = useMemo(() => {
    const sorted = [...files].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'size':
          comparison = b.size - a.size
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [files, sortBy, sortOrder])

  const starredFiles = useMemo(() => files.filter(f => f.isStarred), [files])
  const sharedFiles = useMemo(() => files.filter(f => f.isShared), [files])
  const starredFolders = useMemo(() => folders.filter(f => f.isStarred), [folders])
  const recentFiles = useMemo(() => [...files].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10), [files])
  const filesByType = useMemo(() => {
    const grouped: Record<string, FileItem[]> = {}
    files.forEach(f => {
      if (!grouped[f.type]) grouped[f.type] = []
      grouped[f.type].push(f)
    })
    return grouped
  }, [files])
  const breadcrumbs = useMemo(() => {
    if (!currentFolder) return [{ id: 'root', name: 'Files', path: '/' }]
    const parts = currentFolder.path.split('/').filter(Boolean)
    const crumbs = [{ id: 'root', name: 'Files', path: '/' }]
    let currentPath = ''
    parts.forEach((part, index) => {
      currentPath += `/${part}`
      const folder = folders.find(f => f.path === currentPath)
      crumbs.push({ id: folder?.id || `path-${index}`, name: part, path: currentPath })
    })
    return crumbs
  }, [currentFolder, folders])
  const isUploading = uploads.some(u => u.status === 'uploading')

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    files: sortedFiles, folders, currentFolder, selectedItems, stats, uploads, breadcrumbs,
    starredFiles, sharedFiles, starredFolders, recentFiles, filesByType,
    isLoading, isUploading, error, viewMode, sortBy, sortOrder, searchQuery,
    refresh, fetchFiles, uploadFiles, deleteFile, deleteFiles, renameFile, moveFile, copyFile, toggleStar,
    shareFile, removeShare, createShareLink, removeShareLink, downloadFile,
    createFolder, renameFolder, deleteFolder, toggleFolderStar,
    selectItem, selectAll, clearSelection, search, formatFileSize,
    setViewMode, setSortBy, setSortOrder, setCurrentFolder
  }
}

export default useFilesHub
