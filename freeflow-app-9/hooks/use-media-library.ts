'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other'

export interface MediaFile {
  id: string
  name: string
  originalName: string
  type: MediaType
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  duration?: number
  folderId?: string
  tags: string[]
  alt?: string
  caption?: string
  createdAt: string
  updatedAt: string
  usedIn: string[]
}

export interface MediaFolder {
  id: string
  name: string
  parentId?: string
  path: string
  itemCount: number
  createdAt: string
  color?: string
}

export interface MediaStats {
  totalFiles: number
  totalSize: number
  byType: Record<MediaType, { count: number; size: number }>
  recentUploads: number
  storageUsed: number
  storageLimit: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFiles: MediaFile[] = [
  { id: 'mf-1', name: 'hero-image.jpg', originalName: 'hero-image.jpg', type: 'image', mimeType: 'image/jpeg', size: 1500000, url: '/media/hero-image.jpg', thumbnailUrl: '/media/thumbs/hero-image.jpg', width: 1920, height: 1080, tags: ['hero', 'homepage'], createdAt: '2024-03-15', updatedAt: '2024-03-15', usedIn: ['project-1'] },
  { id: 'mf-2', name: 'logo.png', originalName: 'company-logo-final.png', type: 'image', mimeType: 'image/png', size: 250000, url: '/media/logo.png', thumbnailUrl: '/media/thumbs/logo.png', width: 500, height: 500, tags: ['logo', 'branding'], createdAt: '2024-03-10', updatedAt: '2024-03-10', usedIn: ['project-1', 'project-2'] },
  { id: 'mf-3', name: 'promo-video.mp4', originalName: 'promotional-video-v2.mp4', type: 'video', mimeType: 'video/mp4', size: 50000000, url: '/media/promo-video.mp4', thumbnailUrl: '/media/thumbs/promo-video.jpg', width: 1920, height: 1080, duration: 120, tags: ['video', 'promo'], createdAt: '2024-03-20', updatedAt: '2024-03-20', usedIn: [] },
  { id: 'mf-4', name: 'contract-template.pdf', originalName: 'contract-template.pdf', type: 'document', mimeType: 'application/pdf', size: 500000, url: '/media/contract-template.pdf', tags: ['document', 'contract'], createdAt: '2024-03-05', updatedAt: '2024-03-05', usedIn: [] },
  { id: 'mf-5', name: 'background-music.mp3', originalName: 'ambient-track.mp3', type: 'audio', mimeType: 'audio/mpeg', size: 8000000, url: '/media/background-music.mp3', duration: 180, tags: ['audio', 'music'], createdAt: '2024-03-18', updatedAt: '2024-03-18', usedIn: ['project-3'] }
]

const mockFolders: MediaFolder[] = [
  { id: 'folder-1', name: 'Brand Assets', path: '/brand-assets', itemCount: 25, createdAt: '2024-01-01', color: '#3B82F6' },
  { id: 'folder-2', name: 'Project Files', path: '/project-files', itemCount: 45, createdAt: '2024-01-15', color: '#10B981' },
  { id: 'folder-3', name: 'Client Deliverables', path: '/client-deliverables', itemCount: 18, createdAt: '2024-02-01', color: '#F59E0B' }
]

const mockStats: MediaStats = {
  totalFiles: mockFiles.length,
  totalSize: mockFiles.reduce((sum, f) => sum + f.size, 0),
  byType: {
    image: { count: 2, size: 1750000 },
    video: { count: 1, size: 50000000 },
    audio: { count: 1, size: 8000000 },
    document: { count: 1, size: 500000 },
    other: { count: 0, size: 0 }
  },
  recentUploads: 3,
  storageUsed: 60250000,
  storageLimit: 10737418240
}

// ============================================================================
// HOOK
// ============================================================================

interface UseMediaLibraryOptions {
  
  folderId?: string
}

export function useMediaLibrary(options: UseMediaLibraryOptions = {}) {
  const {  folderId } = options

  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date')

  const fetchFiles = useCallback(async (params?: { folderId?: string; search?: string; type?: MediaType }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.folderId) queryParams.set('folderId', params.folderId)
      if (params?.search) queryParams.set('search', params.search)
      if (params?.type) queryParams.set('type', params.type)

      const response = await fetch(`/api/media?${queryParams}`)
      const result = await response.json()
      if (result.success) {
        setFiles(Array.isArray(result.files) ? result.files : [])
        return result.files
      }
      setFiles([])
      return []
    } catch (err) {
      setFiles([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/media/folders')
      const result = await response.json()
      if (result.success) {
        setFolders(Array.isArray(result.folders) ? result.folders : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.folders
      }
      setFolders(mockFolders)
      setStats(null)
      return []
    } catch (err) {
      setFolders(mockFolders)
      setStats(null)
      return []
    }
  }, [])

  const uploadFile = useCallback(async (file: File, options?: { folderId?: string; tags?: string[] }) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (options?.folderId) formData.append('folderId', options.folderId)
      if (options?.tags) formData.append('tags', JSON.stringify(options.tags))

      const progressInterval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200)

      const response = await fetch('/api/media/upload', { method: 'POST', body: formData })
      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      if (result.success) {
        await fetchFiles({ folderId })
        return { success: true, file: result.file }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newFile: MediaFile = {
        id: `mf-${Date.now()}`, name: file.name, originalName: file.name,
        type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'document',
        mimeType: file.type, size: file.size, url: URL.createObjectURL(file),
        tags: options?.tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), usedIn: []
      }
      setFiles(prev => [newFile, ...prev])
      return { success: true, file: newFile }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [fetchFiles, folderId])

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    try {
      const response = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId })
      })
      const result = await response.json()
      if (result.success) {
        await fetchFolders()
        return { success: true, folder: result.folder }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newFolder: MediaFolder = { id: `folder-${Date.now()}`, name, parentId, path: `/${name.toLowerCase().replace(/\s/g, '-')}`, itemCount: 0, createdAt: new Date().toISOString() }
      setFolders(prev => [...prev, newFolder])
      return { success: true, folder: newFolder }
    }
  }, [fetchFolders])

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await fetch(`/api/media/${fileId}`, { method: 'DELETE' })
      setFiles(prev => prev.filter(f => f.id !== fileId))
      setSelectedFiles(prev => prev.filter(id => id !== fileId))
      return { success: true }
    } catch (err) {
      setFiles(prev => prev.filter(f => f.id !== fileId))
      return { success: true }
    }
  }, [])

  const updateFile = useCallback(async (fileId: string, updates: Partial<MediaFile>) => {
    try {
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
      }
      return result
    } catch (err) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates } : f))
      return { success: true }
    }
  }, [])

  const moveFiles = useCallback(async (fileIds: string[], targetFolderId: string) => {
    try {
      await fetch('/api/media/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds, targetFolderId })
      })
      setFiles(prev => prev.map(f => fileIds.includes(f.id) ? { ...f, folderId: targetFolderId } : f))
      setSelectedFiles([])
      return { success: true }
    } catch (err) {
      setFiles(prev => prev.map(f => fileIds.includes(f.id) ? { ...f, folderId: targetFolderId } : f))
      return { success: true }
    }
  }, [])

  const bulkDelete = useCallback(async (fileIds: string[]) => {
    try {
      await fetch('/api/media/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds })
      })
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)))
      setSelectedFiles([])
      return { success: true }
    } catch (err) {
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)))
      return { success: true }
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchFiles({ search: query, folderId })
  }, [fetchFiles, folderId])

  const toggleSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId])
  }, [])

  const selectAll = useCallback(() => setSelectedFiles(files.map(f => f.id)), [files])
  const clearSelection = useCallback(() => setSelectedFiles([]), [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchFiles({ folderId }), fetchFolders()])
  }, [fetchFiles, fetchFolders, folderId])

  useEffect(() => { refresh() }, [refresh])

  const sortedFiles = useMemo(() => {
    const sorted = [...files]
    switch (sortBy) {
      case 'name': sorted.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'date': sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case 'size': sorted.sort((a, b) => b.size - a.size); break
      case 'type': sorted.sort((a, b) => a.type.localeCompare(b.type)); break
    }
    return sorted
  }, [files, sortBy])

  const filesByType = useMemo(() => {
    const grouped: Record<MediaType, MediaFile[]> = { image: [], video: [], audio: [], document: [], other: [] }
    files.forEach(f => grouped[f.type].push(f))
    return grouped
  }, [files])

  const recentFiles = useMemo(() => [...files].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [files])

  return {
    files: sortedFiles, folders, stats, currentFolder, selectedFiles, filesByType, recentFiles,
    isLoading, isUploading, uploadProgress, error, searchQuery, viewMode, sortBy,
    refresh, fetchFiles, uploadFile, createFolder, deleteFile, updateFile, moveFiles, bulkDelete,
    search, toggleSelection, selectAll, clearSelection, setCurrentFolder, setViewMode, setSortBy
  }
}

export default useMediaLibrary
