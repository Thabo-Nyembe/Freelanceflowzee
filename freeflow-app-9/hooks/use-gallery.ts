'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type GalleryItemType = 'image' | 'video' | 'audio' | 'document'
export type GalleryCategory = 'all' | 'branding' | 'web-design' | 'mobile' | 'social' | 'print' | 'video' | 'photography'

export interface GalleryItem {
  id: string
  title: string
  description?: string
  type: GalleryItemType
  category: GalleryCategory
  url: string
  thumbnailUrl?: string
  dateCreated: string
  updatedAt?: string
  likes: number
  comments: number
  views: number
  client?: string
  project?: string
  tags: string[]
  featured: boolean
  size?: number
  dimensions?: { width: number; height: number }
  duration?: number
  userId: string
}

export interface GalleryAlbum {
  id: string
  name: string
  description?: string
  coverImage?: string
  itemCount: number
  createdAt: string
  updatedAt: string
  shareUrl?: string
  isPublic: boolean
}

export interface GalleryStats {
  totalItems: number
  totalStorage: number
  totalViews: number
  totalLikes: number
  itemsByType: Record<GalleryItemType, number>
  itemsByCategory: Record<string, number>
}

export interface CategoryInfo {
  id: string
  label: string
  count: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockGalleryItems: GalleryItem[] = [
  { id: 'gi-1', title: 'Brand Identity Design', type: 'image', category: 'branding', url: '/gallery/brand-1.jpg', thumbnailUrl: '/gallery/brand-1-thumb.jpg', dateCreated: '2024-01-15', likes: 24, comments: 8, views: 156, client: 'Acme Corp', project: 'Brand Identity', tags: ['logo', 'branding', 'identity'], featured: true, userId: 'user-1' },
  { id: 'gi-2', title: 'Website Redesign Mockup', type: 'image', category: 'web-design', url: '/gallery/web-1.jpg', thumbnailUrl: '/gallery/web-1-thumb.jpg', dateCreated: '2024-01-20', likes: 42, comments: 15, views: 280, client: 'TechStart', project: 'Website Redesign', tags: ['web', 'ui', 'mockup'], featured: true, userId: 'user-1' },
  { id: 'gi-3', title: 'Mobile App UI Kit', type: 'image', category: 'mobile', url: '/gallery/mobile-1.jpg', thumbnailUrl: '/gallery/mobile-1-thumb.jpg', dateCreated: '2024-02-01', likes: 38, comments: 12, views: 220, tags: ['mobile', 'app', 'ui-kit'], featured: false, userId: 'user-1' },
  { id: 'gi-4', title: 'Product Showcase Video', type: 'video', category: 'video', url: '/gallery/video-1.mp4', thumbnailUrl: '/gallery/video-1-thumb.jpg', dateCreated: '2024-02-10', likes: 56, comments: 22, views: 450, client: 'Startup Inc', tags: ['video', 'product', 'showcase'], featured: true, duration: 120, userId: 'user-1' },
  { id: 'gi-5', title: 'Social Media Campaign', type: 'image', category: 'social', url: '/gallery/social-1.jpg', thumbnailUrl: '/gallery/social-1-thumb.jpg', dateCreated: '2024-02-15', likes: 18, comments: 5, views: 95, tags: ['social', 'campaign', 'instagram'], featured: false, userId: 'user-1' },
  { id: 'gi-6', title: 'Print Brochure Design', type: 'image', category: 'print', url: '/gallery/print-1.jpg', thumbnailUrl: '/gallery/print-1-thumb.jpg', dateCreated: '2024-02-20', likes: 12, comments: 3, views: 68, client: 'Local Business', tags: ['print', 'brochure', 'design'], featured: false, userId: 'user-1' }
]

const mockAlbums: GalleryAlbum[] = [
  { id: 'album-1', name: 'Best of 2024', description: 'My top projects from 2024', coverImage: '/gallery/brand-1-thumb.jpg', itemCount: 12, createdAt: '2024-01-01', updatedAt: '2024-03-01', shareUrl: 'https://kazi.app/gallery/best-2024', isPublic: true },
  { id: 'album-2', name: 'Client Work', description: 'Projects for various clients', coverImage: '/gallery/web-1-thumb.jpg', itemCount: 8, createdAt: '2024-02-01', updatedAt: '2024-03-15', isPublic: false }
]

const mockStats: GalleryStats = {
  totalItems: mockGalleryItems.length,
  totalStorage: 256000000,
  totalViews: mockGalleryItems.reduce((sum, i) => sum + i.views, 0),
  totalLikes: mockGalleryItems.reduce((sum, i) => sum + i.likes, 0),
  itemsByType: { image: 5, video: 1, audio: 0, document: 0 },
  itemsByCategory: { branding: 1, 'web-design': 1, mobile: 1, social: 1, print: 1, video: 1 }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseGalleryOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
  category?: GalleryCategory
  featured?: boolean
}

export function useGallery(options: UseGalleryOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 60000,
    category = 'all',
    featured
  } = options

  // State
  const [items, setItems] = useState<GalleryItem[]>([])
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [stats, setStats] = useState<GalleryStats | null>(null)
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch gallery items
  const fetchItems = useCallback(async (filters?: { category?: string; search?: string; featured?: boolean }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.featured) params.set('featured', 'true')

      const response = await fetch(`/api/gallery?${params}`)
      const result = await response.json()

      if (result.success) {
        setItems(result.items || [])
        setCategories(result.categories || [])
        return result.items
      }
      setItems(mockGalleryItems)
      return []
    } catch (err) {
      console.error('Error fetching gallery:', err)
      setItems(mockGalleryItems)
      setError(err instanceof Error ? err : new Error('Failed to fetch gallery'))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch albums
  const fetchAlbums = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery/albums')
      const result = await response.json()
      if (result.success) {
        setAlbums(result.albums || [])
        return result.albums
      }
      setAlbums(mockAlbums)
      return []
    } catch (err) {
      console.error('Error fetching albums:', err)
      setAlbums(mockAlbums)
      return []
    }
  }, [])

  // Upload item
  const uploadItem = useCallback(async (file: File, metadata: { title: string; category: string; tags: string[] }) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', metadata.title)
      formData.append('category', metadata.category)
      formData.append('tags', JSON.stringify(metadata.tags))

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload', data: { file, ...metadata } })
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      if (result.success) {
        await fetchItems({ category, search: searchQuery, featured })
        return { success: true, item: result.item }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error uploading:', err)
      return { success: false, error: 'Failed to upload' }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [fetchItems, category, searchQuery, featured])

  // Create album
  const createAlbum = useCallback(async (data: { name: string; description?: string; itemIds?: string[] }) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-album', data })
      })

      const result = await response.json()
      if (result.success) {
        await fetchAlbums()
        return { success: true, album: result.album }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error creating album:', err)
      return { success: false, error: 'Failed to create album' }
    }
  }, [fetchAlbums])

  // Bulk operations
  const bulkTag = useCallback(async (itemIds: string[], tags: string[], mode: 'add' | 'remove' | 'replace') => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-tag', data: { itemIds, tags, mode } })
      })

      const result = await response.json()
      if (result.success) {
        await fetchItems({ category, search: searchQuery, featured })
      }
      return result
    } catch (err) {
      console.error('Error bulk tagging:', err)
      return { success: false, error: 'Failed to tag items' }
    }
  }, [fetchItems, category, searchQuery, featured])

  const bulkDelete = useCallback(async (itemIds: string[]) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-delete', data: { itemIds } })
      })

      const result = await response.json()
      if (result.success) {
        setItems(prev => prev.filter(i => !itemIds.includes(i.id)))
        setSelectedItems([])
      }
      return result
    } catch (err) {
      console.error('Error deleting items:', err)
      return { success: false, error: 'Failed to delete items' }
    }
  }, [])

  const exportCollection = useCallback(async (itemIds: string[], format: 'zip' | 'pdf' | 'portfolio') => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-collection', data: { itemIds, format } })
      })

      const result = await response.json()
      if (result.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      }
      return result
    } catch (err) {
      console.error('Error exporting:', err)
      return { success: false, error: 'Failed to export' }
    }
  }, [])

  const aiEnhance = useCallback(async (itemId: string, enhanceType: 'upscale' | 'restore' | 'colorize' | 'enhance' | 'background-remove') => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-enhance', data: { itemId, enhanceType } })
      })
      return await response.json()
    } catch (err) {
      console.error('Error enhancing:', err)
      return { success: false, error: 'Failed to enhance' }
    }
  }, [])

  // Search
  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchItems({ category, search: query, featured })
  }, [fetchItems, category, featured])

  // Toggle item selection
  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedItems(items.map(i => i.id))
  }, [items])

  const clearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  // Refresh
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([
      fetchItems({ category, search: searchQuery, featured }),
      fetchAlbums()
    ])
  }, [fetchItems, fetchAlbums, category, searchQuery, featured])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  // Computed
  const featuredItems = useMemo(() => items.filter(i => i.featured), [items])
  const recentItems = useMemo(() => [...items].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).slice(0, 10), [items])
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, GalleryItem[]> = {}
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    })
    return grouped
  }, [items])

  return {
    items, albums, stats, categories, featuredItems, recentItems, itemsByCategory,
    isLoading, error, searchQuery, selectedItems, uploadProgress, isUploading,
    refresh, fetchItems, fetchAlbums, uploadItem, createAlbum,
    bulkTag, bulkDelete, exportCollection, aiEnhance,
    search, toggleSelection, selectAll, clearSelection
  }
}

export default useGallery
