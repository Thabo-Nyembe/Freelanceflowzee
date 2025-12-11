/**
 * KAZI Document Management System - Database Queries
 * World-class backend infrastructure for document management
 */

import { supabase } from './supabase'

// =====================================================
// TYPES
// =====================================================

export interface Folder {
  id: string
  user_id: string
  name: string
  description?: string
  parent_id?: string
  color?: string
  icon?: string
  is_shared: boolean
  is_starred: boolean
  is_archived: boolean
  shared_with: string[]
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  // Computed
  document_count?: number
  total_size?: number
  path?: string
}

export interface Document {
  id: string
  user_id: string
  folder_id?: string
  name: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  mime_type: string
  version: number
  status: 'draft' | 'published' | 'archived' | 'deleted'
  is_starred: boolean
  is_shared: boolean
  is_template: boolean
  shared_with: string[]
  tags: string[]
  metadata: Record<string, any>
  thumbnail_url?: string
  preview_url?: string
  download_count: number
  view_count: number
  last_viewed_at?: string
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_url: string
  file_size: number
  change_summary?: string
  created_by: string
  created_at: string
}

export interface DocumentComment {
  id: string
  document_id: string
  user_id: string
  content: string
  parent_id?: string
  position?: Record<string, any>
  is_resolved: boolean
  resolved_by?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface DocumentShare {
  id: string
  document_id: string
  shared_by: string
  shared_with_email: string
  shared_with_user_id?: string
  permission: 'view' | 'comment' | 'edit' | 'admin'
  expires_at?: string
  access_count: number
  last_accessed_at?: string
  share_link?: string
  is_public: boolean
  password_hash?: string
  created_at: string
}

export interface DocumentActivity {
  id: string
  document_id: string
  user_id: string
  action: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// =====================================================
// FOLDER OPERATIONS
// =====================================================

export async function getFolders(userId: string, parentId?: string | null): Promise<Folder[]> {
  try {
    let query = supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('name', { ascending: true })

    if (parentId === null) {
      query = query.is('parent_id', null)
    } else if (parentId) {
      query = query.eq('parent_id', parentId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching folders:', error)
    return []
  }
}

export async function getFolderById(folderId: string): Promise<Folder | null> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching folder:', error)
    return null
  }
}

export async function createFolder(folder: Partial<Folder>): Promise<Folder | null> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: folder.user_id,
        name: folder.name,
        description: folder.description,
        parent_id: folder.parent_id,
        color: folder.color || '#3B82F6',
        icon: folder.icon || 'folder',
        is_shared: folder.is_shared || false,
        is_starred: folder.is_starred || false,
        is_archived: false,
        shared_with: folder.shared_with || [],
        tags: folder.tags || [],
        metadata: folder.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating folder:', error)
    return null
  }
}

export async function updateFolder(folderId: string, updates: Partial<Folder>): Promise<Folder | null> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating folder:', error)
    return null
  }
}

export async function deleteFolder(folderId: string, permanent: boolean = false): Promise<boolean> {
  try {
    if (permanent) {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('folders')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', folderId)

      if (error) throw error
    }
    return true
  } catch (error) {
    console.error('Error deleting folder:', error)
    return false
  }
}

export async function toggleFolderStar(folderId: string, isStarred: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('folders')
      .update({ is_starred: isStarred, updated_at: new Date().toISOString() })
      .eq('id', folderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling folder star:', error)
    return false
  }
}

export async function moveFolder(folderId: string, newParentId: string | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('folders')
      .update({ parent_id: newParentId, updated_at: new Date().toISOString() })
      .eq('id', folderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error moving folder:', error)
    return false
  }
}

export async function getFolderPath(folderId: string): Promise<Folder[]> {
  try {
    const path: Folder[] = []
    let currentId: string | null = folderId

    while (currentId) {
      const folder = await getFolderById(currentId)
      if (folder) {
        path.unshift(folder)
        currentId = folder.parent_id || null
      } else {
        break
      }
    }

    return path
  } catch (error) {
    console.error('Error getting folder path:', error)
    return []
  }
}

// =====================================================
// DOCUMENT OPERATIONS
// =====================================================

export async function getDocuments(
  userId: string,
  options: {
    folderId?: string | null
    status?: string
    isStarred?: boolean
    isTemplate?: boolean
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  } = {}
): Promise<{ documents: Document[]; total: number }> {
  try {
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (options.folderId === null) {
      query = query.is('folder_id', null)
    } else if (options.folderId) {
      query = query.eq('folder_id', options.folderId)
    }

    if (options.status) {
      query = query.eq('status', options.status)
    } else {
      query = query.neq('status', 'deleted')
    }

    if (options.isStarred !== undefined) {
      query = query.eq('is_starred', options.isStarred)
    }

    if (options.isTemplate !== undefined) {
      query = query.eq('is_template', options.isTemplate)
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags)
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    // Apply ordering
    const orderBy = options.orderBy || 'created_at'
    const orderDirection = options.orderDirection || 'desc'
    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    const { data, error, count } = await query

    if (error) throw error
    return { documents: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return { documents: [], total: 0 }
  }
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error) throw error

    // Increment view count
    await supabase
      .from('documents')
      .update({
        view_count: (data.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', documentId)

    return data
  } catch (error) {
    console.error('Error fetching document:', error)
    return null
  }
}

export async function createDocument(document: Partial<Document>): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: document.user_id,
        folder_id: document.folder_id,
        name: document.name,
        description: document.description,
        file_url: document.file_url,
        file_type: document.file_type,
        file_size: document.file_size,
        mime_type: document.mime_type,
        version: 1,
        status: document.status || 'draft',
        is_starred: false,
        is_shared: false,
        is_template: document.is_template || false,
        shared_with: [],
        tags: document.tags || [],
        metadata: document.metadata || {},
        thumbnail_url: document.thumbnail_url,
        preview_url: document.preview_url,
        download_count: 0,
        view_count: 0
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    if (data) {
      await logDocumentActivity(data.id, document.user_id!, 'created', { name: document.name })
    }

    return data
  } catch (error) {
    console.error('Error creating document:', error)
    return null
  }
}

export async function updateDocument(documentId: string, updates: Partial<Document>): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (error) throw error

    // Log activity
    if (data) {
      await logDocumentActivity(data.id, data.user_id, 'updated', { fields: Object.keys(updates) })
    }

    return data
  } catch (error) {
    console.error('Error updating document:', error)
    return null
  }
}

export async function deleteDocument(documentId: string, permanent: boolean = false): Promise<boolean> {
  try {
    const document = await getDocumentById(documentId)
    if (!document) return false

    if (permanent) {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', documentId)

      if (error) throw error

      await logDocumentActivity(documentId, document.user_id, 'deleted', { name: document.name })
    }

    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    return false
  }
}

export async function toggleDocumentStar(documentId: string, isStarred: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ is_starred: isStarred, updated_at: new Date().toISOString() })
      .eq('id', documentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling document star:', error)
    return false
  }
}

export async function moveDocument(documentId: string, newFolderId: string | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ folder_id: newFolderId, updated_at: new Date().toISOString() })
      .eq('id', documentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error moving document:', error)
    return false
  }
}

export async function duplicateDocument(documentId: string): Promise<Document | null> {
  try {
    const original = await getDocumentById(documentId)
    if (!original) return null

    return await createDocument({
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      is_starred: false,
      is_shared: false,
      shared_with: [],
      download_count: 0,
      view_count: 0
    })
  } catch (error) {
    console.error('Error duplicating document:', error)
    return null
  }
}

export async function incrementDownloadCount(documentId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('documents')
      .select('download_count, user_id')
      .eq('id', documentId)
      .single()

    if (data) {
      await supabase
        .from('documents')
        .update({ download_count: (data.download_count || 0) + 1 })
        .eq('id', documentId)

      await logDocumentActivity(documentId, data.user_id, 'downloaded', {})
    }
  } catch (error) {
    console.error('Error incrementing download count:', error)
  }
}

// =====================================================
// DOCUMENT VERSIONS
// =====================================================

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  try {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching document versions:', error)
    return []
  }
}

export async function createDocumentVersion(
  documentId: string,
  fileUrl: string,
  fileSize: number,
  changeSummary: string,
  createdBy: string
): Promise<DocumentVersion | null> {
  try {
    // Get current version number
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('version')
      .eq('id', documentId)
      .single()

    const newVersionNumber = (currentDoc?.version || 0) + 1

    // Create version record
    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersionNumber,
        file_url: fileUrl,
        file_size: fileSize,
        change_summary: changeSummary,
        created_by: createdBy
      })
      .select()
      .single()

    if (error) throw error

    // Update document with new version
    await supabase
      .from('documents')
      .update({
        version: newVersionNumber,
        file_url: fileUrl,
        file_size: fileSize,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    // Log activity
    await logDocumentActivity(documentId, createdBy, 'version_created', {
      version: newVersionNumber,
      summary: changeSummary
    })

    return data
  } catch (error) {
    console.error('Error creating document version:', error)
    return null
  }
}

export async function restoreDocumentVersion(documentId: string, versionId: string): Promise<boolean> {
  try {
    const { data: version } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .single()

    if (!version) return false

    const { data: currentDoc } = await supabase
      .from('documents')
      .select('file_url, file_size, version, user_id')
      .eq('id', documentId)
      .single()

    if (!currentDoc) return false

    // Create backup of current version
    await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: currentDoc.version,
        file_url: currentDoc.file_url,
        file_size: currentDoc.file_size,
        change_summary: 'Auto-backup before restore',
        created_by: currentDoc.user_id
      })

    // Restore the selected version
    await supabase
      .from('documents')
      .update({
        file_url: version.file_url,
        file_size: version.file_size,
        version: currentDoc.version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    await logDocumentActivity(documentId, currentDoc.user_id, 'version_restored', {
      restored_version: version.version_number
    })

    return true
  } catch (error) {
    console.error('Error restoring document version:', error)
    return false
  }
}

// =====================================================
// DOCUMENT COMMENTS
// =====================================================

export async function getDocumentComments(documentId: string): Promise<DocumentComment[]> {
  try {
    const { data, error } = await supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching document comments:', error)
    return []
  }
}

export async function createDocumentComment(comment: Partial<DocumentComment>): Promise<DocumentComment | null> {
  try {
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: comment.document_id,
        user_id: comment.user_id,
        content: comment.content,
        parent_id: comment.parent_id,
        position: comment.position,
        is_resolved: false
      })
      .select()
      .single()

    if (error) throw error

    await logDocumentActivity(comment.document_id!, comment.user_id!, 'comment_added', {
      comment_id: data.id
    })

    return data
  } catch (error) {
    console.error('Error creating document comment:', error)
    return null
  }
}

export async function resolveDocumentComment(commentId: string, resolvedBy: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_comments')
      .update({
        is_resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error resolving comment:', error)
    return false
  }
}

export async function deleteDocumentComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}

// =====================================================
// DOCUMENT SHARING
// =====================================================

export async function getDocumentShares(documentId: string): Promise<DocumentShare[]> {
  try {
    const { data, error } = await supabase
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching document shares:', error)
    return []
  }
}

export async function shareDocument(share: Partial<DocumentShare>): Promise<DocumentShare | null> {
  try {
    const shareLink = share.is_public
      ? `${process.env.NEXT_PUBLIC_APP_URL}/shared/${generateShareToken()}`
      : undefined

    const { data, error } = await supabase
      .from('document_shares')
      .insert({
        document_id: share.document_id,
        shared_by: share.shared_by,
        shared_with_email: share.shared_with_email,
        shared_with_user_id: share.shared_with_user_id,
        permission: share.permission || 'view',
        expires_at: share.expires_at,
        share_link: shareLink,
        is_public: share.is_public || false,
        password_hash: share.password_hash,
        access_count: 0
      })
      .select()
      .single()

    if (error) throw error

    // Update document shared status
    await supabase
      .from('documents')
      .update({ is_shared: true, updated_at: new Date().toISOString() })
      .eq('id', share.document_id)

    await logDocumentActivity(share.document_id!, share.shared_by!, 'shared', {
      shared_with: share.shared_with_email,
      permission: share.permission
    })

    return data
  } catch (error) {
    console.error('Error sharing document:', error)
    return null
  }
}

export async function updateDocumentShare(shareId: string, updates: Partial<DocumentShare>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_shares')
      .update(updates)
      .eq('id', shareId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating document share:', error)
    return false
  }
}

export async function revokeDocumentShare(shareId: string): Promise<boolean> {
  try {
    const { data: share } = await supabase
      .from('document_shares')
      .select('document_id, shared_by')
      .eq('id', shareId)
      .single()

    const { error } = await supabase
      .from('document_shares')
      .delete()
      .eq('id', shareId)

    if (error) throw error

    // Check if document still has any shares
    if (share) {
      const { count } = await supabase
        .from('document_shares')
        .select('id', { count: 'exact' })
        .eq('document_id', share.document_id)

      if (count === 0) {
        await supabase
          .from('documents')
          .update({ is_shared: false })
          .eq('id', share.document_id)
      }

      await logDocumentActivity(share.document_id, share.shared_by, 'share_revoked', {
        share_id: shareId
      })
    }

    return true
  } catch (error) {
    console.error('Error revoking document share:', error)
    return false
  }
}

export async function getSharedDocumentByLink(shareToken: string): Promise<{ document: Document; share: DocumentShare } | null> {
  try {
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${shareToken}`

    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .select('*')
      .eq('share_link', shareLink)
      .single()

    if (shareError || !share) return null

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return null
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', share.document_id)
      .single()

    if (docError || !document) return null

    // Increment access count
    await supabase
      .from('document_shares')
      .update({
        access_count: share.access_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', share.id)

    return { document, share }
  } catch (error) {
    console.error('Error getting shared document:', error)
    return null
  }
}

// =====================================================
// DOCUMENT ACTIVITY
// =====================================================

export async function getDocumentActivity(documentId: string, limit: number = 50): Promise<DocumentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('document_activity')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching document activity:', error)
    return []
  }
}

export async function logDocumentActivity(
  documentId: string,
  userId: string,
  action: string,
  details: Record<string, any>
): Promise<void> {
  try {
    await supabase
      .from('document_activity')
      .insert({
        document_id: documentId,
        user_id: userId,
        action,
        details
      })
  } catch (error) {
    console.error('Error logging document activity:', error)
  }
}

// =====================================================
// SEARCH & ANALYTICS
// =====================================================

export async function searchDocuments(
  userId: string,
  query: string,
  options: {
    fileTypes?: string[]
    dateFrom?: string
    dateTo?: string
    tags?: string[]
    folderId?: string
    limit?: number
  } = {}
): Promise<Document[]> {
  try {
    let dbQuery = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)

    if (options.fileTypes && options.fileTypes.length > 0) {
      dbQuery = dbQuery.in('file_type', options.fileTypes)
    }

    if (options.dateFrom) {
      dbQuery = dbQuery.gte('created_at', options.dateFrom)
    }

    if (options.dateTo) {
      dbQuery = dbQuery.lte('created_at', options.dateTo)
    }

    if (options.tags && options.tags.length > 0) {
      dbQuery = dbQuery.contains('tags', options.tags)
    }

    if (options.folderId) {
      dbQuery = dbQuery.eq('folder_id', options.folderId)
    }

    dbQuery = dbQuery
      .order('updated_at', { ascending: false })
      .limit(options.limit || 50)

    const { data, error } = await dbQuery

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching documents:', error)
    return []
  }
}

export async function getDocumentStats(userId: string): Promise<{
  totalDocuments: number
  totalSize: number
  byType: Record<string, number>
  byStatus: Record<string, number>
  recentlyViewed: Document[]
  starredCount: number
  sharedCount: number
}> {
  try {
    // Get total counts
    const { count: totalDocuments } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .neq('status', 'deleted')

    // Get starred count
    const { count: starredCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_starred', true)

    // Get shared count
    const { count: sharedCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_shared', true)

    // Get all documents for aggregation
    const { data: allDocs } = await supabase
      .from('documents')
      .select('file_type, file_size, status')
      .eq('user_id', userId)
      .neq('status', 'deleted')

    // Calculate stats
    let totalSize = 0
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    allDocs?.forEach(doc => {
      totalSize += doc.file_size || 0
      byType[doc.file_type] = (byType[doc.file_type] || 0) + 1
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1
    })

    // Get recently viewed
    const { data: recentlyViewed } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .not('last_viewed_at', 'is', null)
      .order('last_viewed_at', { ascending: false })
      .limit(10)

    return {
      totalDocuments: totalDocuments || 0,
      totalSize,
      byType,
      byStatus,
      recentlyViewed: recentlyViewed || [],
      starredCount: starredCount || 0,
      sharedCount: sharedCount || 0
    }
  } catch (error) {
    console.error('Error getting document stats:', error)
    return {
      totalDocuments: 0,
      totalSize: 0,
      byType: {},
      byStatus: {},
      recentlyViewed: [],
      starredCount: 0,
      sharedCount: 0
    }
  }
}

// =====================================================
// TEMPLATES
// =====================================================

export async function getDocumentTemplates(userId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`user_id.eq.${userId},is_shared.eq.true`)
      .eq('is_template', true)
      .eq('status', 'published')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching document templates:', error)
    return []
  }
}

export async function createFromTemplate(templateId: string, userId: string, name: string, folderId?: string): Promise<Document | null> {
  try {
    const template = await getDocumentById(templateId)
    if (!template) return null

    return await createDocument({
      user_id: userId,
      folder_id: folderId,
      name,
      description: template.description,
      file_url: template.file_url,
      file_type: template.file_type,
      file_size: template.file_size,
      mime_type: template.mime_type,
      status: 'draft',
      is_template: false,
      tags: template.tags,
      metadata: {
        ...template.metadata,
        created_from_template: templateId
      }
    })
  } catch (error) {
    console.error('Error creating document from template:', error)
    return null
  }
}

// =====================================================
// BULK OPERATIONS
// =====================================================

export async function bulkMoveDocuments(documentIds: string[], folderId: string | null): Promise<number> {
  try {
    const { error, count } = await supabase
      .from('documents')
      .update({ folder_id: folderId, updated_at: new Date().toISOString() })
      .in('id', documentIds)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error bulk moving documents:', error)
    return 0
  }
}

export async function bulkDeleteDocuments(documentIds: string[], permanent: boolean = false): Promise<number> {
  try {
    if (permanent) {
      const { error, count } = await supabase
        .from('documents')
        .delete()
        .in('id', documentIds)

      if (error) throw error
      return count || 0
    } else {
      const { error, count } = await supabase
        .from('documents')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', documentIds)

      if (error) throw error
      return count || 0
    }
  } catch (error) {
    console.error('Error bulk deleting documents:', error)
    return 0
  }
}

export async function bulkTagDocuments(documentIds: string[], tags: string[], mode: 'add' | 'replace'): Promise<number> {
  try {
    let successCount = 0

    for (const docId of documentIds) {
      const { data: doc } = await supabase
        .from('documents')
        .select('tags')
        .eq('id', docId)
        .single()

      if (doc) {
        const newTags = mode === 'replace'
          ? tags
          : [...new Set([...(doc.tags || []), ...tags])]

        const { error } = await supabase
          .from('documents')
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq('id', docId)

        if (!error) successCount++
      }
    }

    return successCount
  } catch (error) {
    console.error('Error bulk tagging documents:', error)
    return 0
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileTypeFromMime(mimeType: string): string {
  const mimeToType: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'application/javascript': 'js',
    'application/json': 'json',
    'application/zip': 'zip'
  }

  return mimeToType[mimeType] || 'file'
}
