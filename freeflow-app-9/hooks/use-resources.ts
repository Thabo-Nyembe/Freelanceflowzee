'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ResourceType = 'document' | 'video' | 'audio' | 'image' | 'link' | 'tool' | 'template' | 'guide' | 'other'
export type ResourceStatus = 'active' | 'archived' | 'draft'
export type AccessLevel = 'public' | 'internal' | 'restricted'

export interface Resource {
  id: string
  title: string
  description?: string
  type: ResourceType
  status: ResourceStatus
  accessLevel: AccessLevel
  url?: string
  fileUrl?: string
  thumbnailUrl?: string
  mimeType?: string
  fileSize?: number
  categoryId: string
  categoryName: string
  tags: string[]
  metadata?: Record<string, any>
  downloadCount: number
  viewCount: number
  rating: number
  ratingCount: number
  isFeatured: boolean
  isPinned: boolean
  expiresAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ResourceCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  resourceCount: number
  order: number
  createdAt: string
}

export interface ResourceCollection {
  id: string
  name: string
  description?: string
  coverImage?: string
  resources: string[]
  isPublic: boolean
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ResourceStats {
  totalResources: number
  activeResources: number
  totalDownloads: number
  totalViews: number
  resourcesByType: Record<string, number>
  topResources: { id: string; title: string; views: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockResources: Resource[] = [
  { id: 'res-1', title: 'Employee Handbook', description: 'Complete guide for employees', type: 'document', status: 'active', accessLevel: 'internal', fileUrl: '/resources/handbook.pdf', mimeType: 'application/pdf', fileSize: 2500000, categoryId: 'rcat-1', categoryName: 'HR Documents', tags: ['hr', 'handbook', 'policy'], downloadCount: 156, viewCount: 420, rating: 4.5, ratingCount: 28, isFeatured: true, isPinned: true, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-15', updatedAt: '2024-03-01' },
  { id: 'res-2', title: 'Product Demo Video', description: 'Watch our product demo', type: 'video', status: 'active', accessLevel: 'public', url: 'https://youtube.com/watch?v=demo', thumbnailUrl: '/resources/demo-thumb.jpg', categoryId: 'rcat-2', categoryName: 'Marketing', tags: ['video', 'demo', 'product'], downloadCount: 0, viewCount: 890, rating: 4.8, ratingCount: 45, isFeatured: true, isPinned: false, createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-02-01', updatedAt: '2024-02-20' },
  { id: 'res-3', title: 'Brand Guidelines', description: 'Official brand assets and guidelines', type: 'guide', status: 'active', accessLevel: 'internal', fileUrl: '/resources/brand-guide.pdf', mimeType: 'application/pdf', fileSize: 15000000, categoryId: 'rcat-2', categoryName: 'Marketing', tags: ['brand', 'design', 'guidelines'], downloadCount: 89, viewCount: 210, rating: 4.2, ratingCount: 12, isFeatured: false, isPinned: false, createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-01-20', updatedAt: '2024-03-10' },
  { id: 'res-4', title: 'API Documentation Link', description: 'Link to our API docs', type: 'link', status: 'active', accessLevel: 'public', url: 'https://docs.example.com/api', categoryId: 'rcat-3', categoryName: 'Development', tags: ['api', 'docs', 'developers'], downloadCount: 0, viewCount: 560, rating: 4.6, ratingCount: 34, isFeatured: false, isPinned: false, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-02-15', updatedAt: '2024-02-15' }
]

const mockCategories: ResourceCategory[] = [
  { id: 'rcat-1', name: 'HR Documents', description: 'Human resources documents', icon: '📋', color: '#3b82f6', resourceCount: 12, order: 1, createdAt: '2024-01-01' },
  { id: 'rcat-2', name: 'Marketing', description: 'Marketing materials', icon: '📢', color: '#22c55e', resourceCount: 25, order: 2, createdAt: '2024-01-01' },
  { id: 'rcat-3', name: 'Development', description: 'Development resources', icon: '💻', color: '#8b5cf6', resourceCount: 18, order: 3, createdAt: '2024-01-01' },
  { id: 'rcat-4', name: 'Training', description: 'Training materials', icon: '🎓', color: '#f59e0b', resourceCount: 8, order: 4, createdAt: '2024-01-01' }
]

const mockCollections: ResourceCollection[] = [
  { id: 'coll-1', name: 'New Employee Onboarding', description: 'Essential resources for new employees', resources: ['res-1'], isPublic: false, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-01', updatedAt: '2024-03-01' },
  { id: 'coll-2', name: 'Sales Toolkit', description: 'Resources for the sales team', coverImage: '/collections/sales.jpg', resources: ['res-2', 'res-3'], isPublic: true, createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-02-01', updatedAt: '2024-03-15' }
]

const mockStats: ResourceStats = {
  totalResources: 63,
  activeResources: 58,
  totalDownloads: 2450,
  totalViews: 12800,
  resourcesByType: { document: 25, video: 12, link: 15, guide: 8, other: 3 },
  topResources: [
    { id: 'res-2', title: 'Product Demo Video', views: 890 },
    { id: 'res-4', title: 'API Documentation Link', views: 560 },
    { id: 'res-1', title: 'Employee Handbook', views: 420 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseResourcesOptions {
  
  categoryId?: string
  type?: ResourceType
}

export function useResources(options: UseResourcesOptions = {}) {
  const {  categoryId, type } = options

  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [collections, setCollections] = useState<ResourceCollection[]>([])
  const [currentResource, setCurrentResource] = useState<Resource | null>(null)
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchResources = useCallback(async (filters?: { categoryId?: string; type?: string; status?: string; accessLevel?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.categoryId || categoryId) params.set('categoryId', filters?.categoryId || categoryId || '')
      if (filters?.type || type) params.set('type', filters?.type || type || '')
      if (filters?.status) params.set('status', filters.status)
      if (filters?.accessLevel) params.set('accessLevel', filters.accessLevel)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/resources?${params}`)
      const result = await response.json()
      if (result.success) {
        setResources(Array.isArray(result.resources) ? result.resources : [])
        setCategories(Array.isArray(result.categories) ? result.categories : [])
        setCollections(Array.isArray(result.collections) ? result.collections : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.resources
      }
      setResources([])
      setCategories(mockCategories)
      setStats(null)
      return []
    } catch (err) {
      setResources([])
      setCategories(mockCategories)
      setCollections(mockCollections)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ categoryId, type])

  const createResource = useCallback(async (data: Omit<Resource, 'id' | 'downloadCount' | 'viewCount' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setResources(prev => [result.resource, ...prev])
        return { success: true, resource: result.resource }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newResource: Resource = { ...data, id: `res-${Date.now()}`, downloadCount: 0, viewCount: 0, rating: 0, ratingCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setResources(prev => [newResource, ...prev])
      return { success: true, resource: newResource }
    }
  }, [])

  const uploadResource = useCallback(async (file: File, metadata: { title: string; categoryId: string; type: ResourceType; description?: string; tags?: string[]; accessLevel?: AccessLevel }) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value))
      })

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/resources/upload', { method: 'POST', body: formData })
      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      if (result.success) {
        setResources(prev => [result.resource, ...prev])
        return { success: true, resource: result.resource }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const category = categories.find(c => c.id === metadata.categoryId)
      const newResource: Resource = {
        id: `res-${Date.now()}`,
        title: metadata.title,
        description: metadata.description,
        type: metadata.type,
        status: 'active',
        accessLevel: metadata.accessLevel || 'internal',
        fileUrl: URL.createObjectURL(file),
        mimeType: file.type,
        fileSize: file.size,
        categoryId: metadata.categoryId,
        categoryName: category?.name || '',
        tags: metadata.tags || [],
        downloadCount: 0,
        viewCount: 0,
        rating: 0,
        ratingCount: 0,
        isFeatured: false,
        isPinned: false,
        createdBy: 'user-1',
        createdByName: 'You',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setResources(prev => [newResource, ...prev])
      return { success: true, resource: newResource }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [categories])

  const updateResource = useCallback(async (resourceId: string, updates: Partial<Resource>) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setResources(prev => prev.map(r => r.id === resourceId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
      }
      return result
    } catch (err) {
      setResources(prev => prev.map(r => r.id === resourceId ? { ...r, ...updates } : r))
      return { success: true }
    }
  }, [])

  const deleteResource = useCallback(async (resourceId: string) => {
    try {
      await fetch(`/api/resources/${resourceId}`, { method: 'DELETE' })
      setResources(prev => prev.filter(r => r.id !== resourceId))
      return { success: true }
    } catch (err) {
      setResources(prev => prev.filter(r => r.id !== resourceId))
      return { success: true }
    }
  }, [])

  const downloadResource = useCallback(async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (resource?.fileUrl) {
      setResources(prev => prev.map(r => r.id === resourceId ? { ...r, downloadCount: r.downloadCount + 1 } : r))
      window.open(resource.fileUrl, '_blank')
    }
    return { success: true }
  }, [resources])

  const recordView = useCallback(async (resourceId: string) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, viewCount: r.viewCount + 1 } : r))
  }, [])

  const rateResource = useCallback(async (resourceId: string, rating: number) => {
    const resource = resources.find(r => r.id === resourceId)
    if (!resource) return { success: false, error: 'Resource not found' }

    const newRatingCount = resource.ratingCount + 1
    const newRating = ((resource.rating * resource.ratingCount) + rating) / newRatingCount

    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, rating: newRating, ratingCount: newRatingCount } : r))
    return { success: true }
  }, [resources])

  const toggleFeatured = useCallback(async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      return updateResource(resourceId, { isFeatured: !resource.isFeatured })
    }
    return { success: false }
  }, [resources, updateResource])

  const togglePinned = useCallback(async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      return updateResource(resourceId, { isPinned: !resource.isPinned })
    }
    return { success: false }
  }, [resources, updateResource])

  const createCollection = useCallback(async (data: { name: string; description?: string; resourceIds?: string[]; isPublic?: boolean }) => {
    const newCollection: ResourceCollection = {
      id: `coll-${Date.now()}`,
      name: data.name,
      description: data.description,
      resources: data.resourceIds || [],
      isPublic: data.isPublic || false,
      createdBy: 'user-1',
      createdByName: 'You',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCollections(prev => [newCollection, ...prev])
    return { success: true, collection: newCollection }
  }, [])

  const addToCollection = useCallback(async (collectionId: string, resourceId: string) => {
    setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, resources: [...c.resources, resourceId], updatedAt: new Date().toISOString() } : c))
    return { success: true }
  }, [])

  const removeFromCollection = useCallback(async (collectionId: string, resourceId: string) => {
    setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, resources: c.resources.filter(r => r !== resourceId), updatedAt: new Date().toISOString() } : c))
    return { success: true }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchResources({ search: query })
  }, [fetchResources])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchResources()
  }, [fetchResources])

  useEffect(() => { refresh() }, [refresh])

  const featuredResources = useMemo(() => resources.filter(r => r.isFeatured && r.status === 'active'), [resources])
  const pinnedResources = useMemo(() => resources.filter(r => r.isPinned && r.status === 'active'), [resources])
  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, Resource[]> = {}
    resources.forEach(r => {
      if (!grouped[r.categoryId]) grouped[r.categoryId] = []
      grouped[r.categoryId].push(r)
    })
    return grouped
  }, [resources])
  const resourcesByType = useMemo(() => {
    const grouped: Record<string, Resource[]> = {}
    resources.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = []
      grouped[r.type].push(r)
    })
    return grouped
  }, [resources])
  const topRated = useMemo(() => [...resources].filter(r => r.ratingCount >= 5).sort((a, b) => b.rating - a.rating).slice(0, 10), [resources])
  const recentResources = useMemo(() => [...resources].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [resources])
  const allTags = useMemo(() => [...new Set(resources.flatMap(r => r.tags))].sort(), [resources])
  const resourceTypes: ResourceType[] = ['document', 'video', 'audio', 'image', 'link', 'tool', 'template', 'guide', 'other']

  return {
    resources, categories, collections, currentResource, stats, featuredResources, pinnedResources,
    resourcesByCategory, resourcesByType, topRated, recentResources, allTags, resourceTypes,
    isLoading, isUploading, uploadProgress, error, searchQuery,
    refresh, fetchResources, createResource, uploadResource, updateResource, deleteResource,
    downloadResource, recordView, rateResource, toggleFeatured, togglePinned,
    createCollection, addToCollection, removeFromCollection, search,
    setCurrentResource
  }
}

export default useResources
