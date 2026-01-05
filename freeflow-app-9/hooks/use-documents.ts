'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type DocumentType = 'contract' | 'proposal' | 'report' | 'invoice' | 'presentation' | 'spreadsheet' | 'image' | 'video' | 'audio' | 'other'
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived' | 'deleted'
export type AccessLevel = 'private' | 'team' | 'organization' | 'public'

export interface Document {
  id: string
  name: string
  description?: string
  type: DocumentType
  status: DocumentStatus
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folderId?: string
  folderPath?: string
  version: number
  accessLevel: AccessLevel
  sharedWith: DocumentShare[]
  tags: string[]
  metadata?: Record<string, any>
  lastModifiedBy: string
  lastModifiedByName: string
  createdBy: string
  createdByName: string
  viewCount: number
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface DocumentShare {
  userId?: string
  email?: string
  name: string
  permission: 'view' | 'edit' | 'admin'
  sharedAt: string
  expiresAt?: string
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  size: number
  url: string
  changes?: string
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  path: string
  color?: string
  icon?: string
  documentCount: number
  accessLevel: AccessLevel
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DocumentStats {
  totalDocuments: number
  totalSize: number
  documentsByType: Record<string, number>
  recentUploads: number
  sharedDocuments: number
  storageUsed: number
  storageLimit: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDocuments: Document[] = [
  { id: 'doc-1', name: 'Q1 Report.pdf', description: 'Quarterly financial report', type: 'report', status: 'approved', mimeType: 'application/pdf', size: 2048576, url: '/documents/q1-report.pdf', folderId: 'folder-1', folderPath: '/Reports', version: 3, accessLevel: 'team', sharedWith: [], tags: ['finance', 'quarterly'], lastModifiedBy: 'user-1', lastModifiedByName: 'Alex Chen', createdBy: 'user-1', createdByName: 'Alex Chen', viewCount: 45, downloadCount: 12, createdAt: '2024-03-01', updatedAt: '2024-03-15' },
  { id: 'doc-2', name: 'Project Proposal.docx', type: 'proposal', status: 'review', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 524288, url: '/documents/proposal.docx', folderId: 'folder-2', folderPath: '/Projects', version: 2, accessLevel: 'private', sharedWith: [{ userId: 'user-2', name: 'Sarah Miller', permission: 'edit', sharedAt: '2024-03-10' }], tags: ['project', 'proposal'], lastModifiedBy: 'user-2', lastModifiedByName: 'Sarah Miller', createdBy: 'user-1', createdByName: 'Alex Chen', viewCount: 8, downloadCount: 3, createdAt: '2024-03-05', updatedAt: '2024-03-18' },
  { id: 'doc-3', name: 'Design Assets.zip', type: 'other', status: 'approved', mimeType: 'application/zip', size: 15728640, url: '/documents/assets.zip', version: 1, accessLevel: 'organization', sharedWith: [], tags: ['design', 'assets'], lastModifiedBy: 'user-2', lastModifiedByName: 'Sarah Miller', createdBy: 'user-2', createdByName: 'Sarah Miller', viewCount: 22, downloadCount: 15, createdAt: '2024-03-10', updatedAt: '2024-03-10' }
]

const mockFolders: Folder[] = [
  { id: 'folder-1', name: 'Reports', path: '/Reports', color: '#3b82f6', documentCount: 12, accessLevel: 'team', createdBy: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-03-15' },
  { id: 'folder-2', name: 'Projects', path: '/Projects', color: '#22c55e', documentCount: 8, accessLevel: 'team', createdBy: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-03-18' },
  { id: 'folder-3', name: 'Contracts', path: '/Contracts', color: '#f59e0b', documentCount: 5, accessLevel: 'private', createdBy: 'user-1', createdAt: '2024-02-01', updatedAt: '2024-03-10' }
]

const mockStats: DocumentStats = {
  totalDocuments: 47,
  totalSize: 256000000,
  documentsByType: { report: 12, proposal: 8, contract: 5, presentation: 10, other: 12 },
  recentUploads: 8,
  sharedDocuments: 15,
  storageUsed: 256000000,
  storageLimit: 10737418240
}

// ============================================================================
// HOOK
// ============================================================================

interface UseDocumentsOptions {
  
  folderId?: string
  type?: DocumentType
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const {  folderId, type } = options

  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDocuments = useCallback(async (filters?: { folderId?: string; type?: string; status?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.folderId || folderId) params.set('folderId', filters?.folderId || folderId || '')
      if (filters?.type || type) params.set('type', filters?.type || type || '')
      if (filters?.status) params.set('status', filters.status)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/documents?${params}`)
      const result = await response.json()
      if (result.success) {
        setDocuments(Array.isArray(result.documents) ? result.documents : [])
        setFolders(Array.isArray(result.folders) ? result.folders : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.documents
      }
      setDocuments([])
      setStats(null)
      return []
    } catch (err) {
      setDocuments([])
      setFolders(mockFolders)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ folderId, type])

  const uploadDocument = useCallback(async (file: File, metadata?: { folderId?: string; description?: string; tags?: string[]; accessLevel?: AccessLevel }) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (metadata?.folderId) formData.append('folderId', metadata.folderId)
      if (metadata?.description) formData.append('description', metadata.description)
      if (metadata?.tags) formData.append('tags', JSON.stringify(metadata.tags))
      if (metadata?.accessLevel) formData.append('accessLevel', metadata.accessLevel)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })
      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      if (result.success) {
        setDocuments(prev => [result.document, ...prev])
        return { success: true, document: result.document }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: 'other',
        status: 'draft',
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        folderId: metadata?.folderId,
        version: 1,
        accessLevel: metadata?.accessLevel || 'private',
        sharedWith: [],
        tags: metadata?.tags || [],
        lastModifiedBy: 'user-1',
        lastModifiedByName: 'You',
        createdBy: 'user-1',
        createdByName: 'You',
        viewCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setDocuments(prev => [newDoc, ...prev])
      return { success: true, document: newDoc }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const updateDocument = useCallback(async (documentId: string, updates: Partial<Document>) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
      }
      return result
    } catch (err) {
      setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, ...updates } : d))
      return { success: true }
    }
  }, [])

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await fetch(`/api/documents/${documentId}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== documentId))
      return { success: true }
    } catch (err) {
      setDocuments(prev => prev.filter(d => d.id !== documentId))
      return { success: true }
    }
  }, [])

  const moveDocument = useCallback(async (documentId: string, targetFolderId: string) => {
    const folder = folders.find(f => f.id === targetFolderId)
    return updateDocument(documentId, { folderId: targetFolderId, folderPath: folder?.path })
  }, [folders, updateDocument])

  const duplicateDocument = useCallback(async (documentId: string) => {
    const original = documents.find(d => d.id === documentId)
    if (!original) return { success: false, error: 'Document not found' }

    const duplicate: Document = {
      ...original,
      id: `doc-${Date.now()}`,
      name: `${original.name} (Copy)`,
      version: 1,
      viewCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setDocuments(prev => [duplicate, ...prev])
    return { success: true, document: duplicate }
  }, [documents])

  const shareDocument = useCallback(async (documentId: string, share: Omit<DocumentShare, 'sharedAt'>) => {
    const doc = documents.find(d => d.id === documentId)
    if (!doc) return { success: false, error: 'Document not found' }

    const newShare: DocumentShare = { ...share, sharedAt: new Date().toISOString() }
    setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, sharedWith: [...d.sharedWith, newShare] } : d))
    return { success: true }
  }, [documents])

  const removeShare = useCallback(async (documentId: string, userId: string) => {
    setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, sharedWith: d.sharedWith.filter(s => s.userId !== userId) } : d))
    return { success: true }
  }, [])

  const createFolder = useCallback(async (data: { name: string; parentId?: string; color?: string }) => {
    const parentFolder = data.parentId ? folders.find(f => f.id === data.parentId) : null
    const path = parentFolder ? `${parentFolder.path}/${data.name}` : `/${data.name}`

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: data.name,
      parentId: data.parentId,
      path,
      color: data.color,
      documentCount: 0,
      accessLevel: 'private',
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setFolders(prev => [...prev, newFolder])
    return { success: true, folder: newFolder }
  }, [folders])

  const updateFolder = useCallback(async (folderId: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
    return { success: true }
  }, [])

  const deleteFolder = useCallback(async (folderId: string, deleteContents?: boolean) => {
    if (deleteContents) {
      setDocuments(prev => prev.filter(d => d.folderId !== folderId))
    }
    setFolders(prev => prev.filter(f => f.id !== folderId))
    return { success: true }
  }, [])

  const fetchVersions = useCallback(async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`)
      const result = await response.json()
      if (result.success) {
        setVersions(result.versions || [])
        return result.versions
      }
      return []
    } catch (err) {
      return []
    }
  }, [])

  const restoreVersion = useCallback(async (documentId: string, versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    if (!version) return { success: false, error: 'Version not found' }

    setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, version: version.version, size: version.size, url: version.url, updatedAt: new Date().toISOString() } : d))
    return { success: true }
  }, [versions])

  const downloadDocument = useCallback(async (documentId: string) => {
    const doc = documents.find(d => d.id === documentId)
    if (doc) {
      setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, downloadCount: d.downloadCount + 1 } : d))
      window.open(doc.url, '_blank')
    }
    return { success: true }
  }, [documents])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchDocuments({ search: query })
  }, [fetchDocuments])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => { refresh() }, [refresh])

  const recentDocuments = useMemo(() => [...documents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10), [documents])
  const sharedDocuments = useMemo(() => documents.filter(d => d.sharedWith.length > 0 || d.accessLevel !== 'private'), [documents])
  const documentsByFolder = useMemo(() => {
    const grouped: Record<string, Document[]> = { root: [] }
    documents.forEach(d => {
      const key = d.folderId || 'root'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(d)
    })
    return grouped
  }, [documents])
  const documentsByType = useMemo(() => {
    const grouped: Record<string, Document[]> = {}
    documents.forEach(d => {
      if (!grouped[d.type]) grouped[d.type] = []
      grouped[d.type].push(d)
    })
    return grouped
  }, [documents])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    documents, folders, versions, currentDocument, currentFolder, stats, recentDocuments, sharedDocuments, documentsByFolder, documentsByType,
    isLoading, isUploading, uploadProgress, error, searchQuery,
    refresh, fetchDocuments, uploadDocument, updateDocument, deleteDocument, moveDocument, duplicateDocument,
    shareDocument, removeShare, createFolder, updateFolder, deleteFolder, fetchVersions, restoreVersion, downloadDocument, search, formatFileSize,
    setCurrentDocument, setCurrentFolder
  }
}

export default useDocuments
