'use client'

import { useSupabaseMutation } from './use-supabase-mutation'
import { useSupabaseQuery } from './use-supabase-helpers'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type DocumentType = 'contract' | 'proposal' | 'report' | 'policy' | 'invoice' | 'presentation' | 'spreadsheet' | 'other'
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived' | 'rejected' | 'published'
export type AccessLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'secret'
export type PermissionLevel = 'view' | 'comment' | 'edit' | 'admin'

// Document folder interface
export interface DocumentFolder {
  id: string
  user_id: string
  name: string
  description?: string
  color?: string
  icon?: string
  parent_id: string | null
  path: string
  depth: number
  is_shared: boolean
  document_count: number
  total_size: number
  created_at: string
  updated_at: string
}

// Document share interface
export interface DocumentShare {
  id: string
  document_id: string | null
  folder_id: string | null
  shared_by: string
  shared_with_user_id?: string
  shared_with_email?: string
  permission_level: PermissionLevel
  public_link?: string
  link_password?: string
  allow_download: boolean
  expires_at?: string
  access_count: number
  is_active: boolean
  created_at: string
}

// Document version interface
export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_size: number
  storage_path: string
  change_summary?: string
  created_by: string
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  document_title: string
  document_type: DocumentType
  status: DocumentStatus
  access_level: AccessLevel
  is_encrypted: boolean
  encryption_key: string | null
  owner: string | null
  department: string | null
  created_by: string | null
  last_modified_by: string | null
  file_path: string | null
  file_url: string | null
  file_name: string | null
  file_extension: string | null
  file_size_bytes: number
  file_size_mb: number
  mime_type: string | null
  version: string
  version_number: number
  previous_version_id: string | null
  is_latest_version: boolean
  version_notes: string | null
  approved_by: string | null
  approved_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  view_count: number
  download_count: number
  share_count: number
  comment_count: number
  unique_viewers: number
  collaborators: string[] | null
  shared_with: string[] | null
  permissions: any
  tags: string[] | null
  categories: string[] | null
  folder_path: string | null
  parent_folder_id: string | null
  expires_at: string | null
  retention_period_days: number | null
  is_archived: boolean
  archived_at: string | null
  description: string | null
  notes: string | null
  checksum: string | null
  language: string | null
  keywords: string[] | null
  created_at: string
  updated_at: string
  last_accessed_at: string | null
  deleted_at: string | null
}

interface UseDocumentsOptions {
  type?: DocumentType | 'all'
  status?: DocumentStatus | 'all'
  department?: string | 'all'
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { type, status, department } = options

  const filters: Record<string, unknown> = {}
  if (type && type !== 'all') {
    filters.document_type = type
  }
  if (status && status !== 'all') {
    filters.status = status
  }
  if (department && department !== 'all') {
    filters.department = department
  }

  return useSupabaseQuery<Document>({
    table: 'documents',
    filters,
    orderBy: { column: 'created_at', ascending: false }
  })
}

export function useDocumentMutations() {
  const { create, update, remove, loading } = useSupabaseMutation({
    table: 'documents'
  })
  const supabase = createClient()

  // Get user ID helper
  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // ============================================
  // DOCUMENT OPERATIONS
  // ============================================

  const createDocument = async (data: Partial<Document>) => {
    return create({
      document_title: data.document_title || 'Untitled Document',
      document_type: data.document_type || 'other',
      status: data.status || 'draft',
      access_level: data.access_level || 'internal',
      is_encrypted: data.is_encrypted || false,
      is_archived: data.is_archived || false,
      is_latest_version: true,
      version: data.version || '1.0',
      version_number: data.version_number || 1,
      view_count: 0,
      download_count: 0,
      share_count: 0,
      comment_count: 0,
      unique_viewers: 0,
      file_size_bytes: data.file_size_bytes || 0,
      file_size_mb: data.file_size_mb || 0,
      file_name: data.file_name,
      file_extension: data.file_extension,
      file_path: data.file_path,
      file_url: data.file_url,
      mime_type: data.mime_type,
      description: data.description,
      tags: data.tags,
      categories: data.categories,
      parent_folder_id: data.parent_folder_id,
      folder_path: data.folder_path,
      ...data
    })
  }

  const updateDocument = async (id: string, data: Partial<Document>) => {
    return update(id, data)
  }

  const deleteDocument = async (id: string) => {
    // First get the document to find the storage path
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single()

    // Delete from storage if there's a file
    if (doc?.file_path) {
      await supabase.storage
        .from('documents')
        .remove([doc.file_path])
    }

    return remove(id, true) // Hard delete
  }

  // ============================================
  // FILE UPLOAD TO SUPABASE STORAGE
  // ============================================

  const uploadDocument = async (file: File, folderId?: string): Promise<Document> => {
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${userId}/${folderId || 'root'}/${timestamp}_${sanitizedFileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath)

    // Determine document type from file extension
    let docType: DocumentType = 'other'
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(fileExtension)) {
      docType = 'report'
    } else if (['xls', 'xlsx', 'csv', 'ods'].includes(fileExtension)) {
      docType = 'spreadsheet'
    } else if (['ppt', 'pptx', 'odp'].includes(fileExtension)) {
      docType = 'presentation'
    } else if (['pdf'].includes(fileExtension)) {
      docType = 'contract'
    }

    // Create document record in database
    const document = await createDocument({
      document_title: file.name.replace(/\.[^/.]+$/, ''),
      document_type: docType,
      file_name: file.name,
      file_extension: fileExtension,
      file_size_bytes: file.size,
      file_size_mb: file.size / (1024 * 1024),
      mime_type: file.type,
      file_path: storagePath,
      file_url: urlData.publicUrl,
      status: 'draft',
      access_level: 'internal',
      parent_folder_id: folderId || null
    })

    toast.success('Document uploaded', {
      description: `"${file.name}" uploaded successfully`
    })

    return document
  }

  // ============================================
  // FOLDER OPERATIONS
  // ============================================

  const createFolder = async (
    name: string,
    parentId?: string,
    options?: { description?: string; color?: string; icon?: string }
  ): Promise<DocumentFolder> => {
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    let path = name
    let depth = 0

    // If parent folder exists, calculate path and depth
    if (parentId) {
      const { data: parent } = await supabase
        .from('folders')
        .select('path, depth')
        .eq('id', parentId)
        .single()

      if (parent) {
        path = `${parent.path}/${name}`
        depth = parent.depth + 1
      }
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        name,
        description: options?.description,
        color: options?.color || '#3B82F6',
        icon: options?.icon,
        parent_id: parentId || null,
        path,
        depth,
        is_shared: false,
        document_count: 0,
        total_size: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create folder: ${error.message}`)
    }

    toast.success('Folder created', {
      description: `"${name}" folder created successfully`
    })

    return data
  }

  const updateFolder = async (
    folderId: string,
    updates: Partial<Pick<DocumentFolder, 'name' | 'description' | 'color' | 'icon'>>
  ): Promise<DocumentFolder> => {
    const { data, error } = await supabase
      .from('folders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update folder: ${error.message}`)
    }

    toast.success('Folder updated')
    return data
  }

  const deleteFolder = async (folderId: string): Promise<void> => {
    // Check if folder has documents
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('parent_folder_id', folderId)

    if (count && count > 0) {
      throw new Error('Cannot delete folder with documents. Move or delete documents first.')
    }

    // Check if folder has subfolders
    const { count: subfolderCount } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', folderId)

    if (subfolderCount && subfolderCount > 0) {
      throw new Error('Cannot delete folder with subfolders. Delete subfolders first.')
    }

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)

    if (error) {
      throw new Error(`Failed to delete folder: ${error.message}`)
    }

    toast.success('Folder deleted')
  }

  const getFolders = async (parentId?: string | null): Promise<DocumentFolder[]> => {
    const userId = await getUserId()
    if (!userId) return []

    let query = supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (parentId === null) {
      query = query.is('parent_id', null)
    } else if (parentId) {
      query = query.eq('parent_id', parentId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to get folders:', error)
      return []
    }

    return data || []
  }

  // ============================================
  // SHARE & PERMISSION OPERATIONS
  // ============================================

  const shareDocument = async (
    documentId: string,
    options?: {
      email?: string
      userId?: string
      permissionLevel?: PermissionLevel
      allowDownload?: boolean
      expiresAt?: string
      createPublicLink?: boolean
      password?: string
    }
  ): Promise<DocumentShare> => {
    const currentUserId = await getUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    const shareData: Record<string, unknown> = {
      document_id: documentId,
      shared_by: currentUserId,
      permission_level: options?.permissionLevel || 'view',
      allow_download: options?.allowDownload ?? true,
      is_active: true,
      access_count: 0
    }

    if (options?.email) {
      shareData.shared_with_email = options.email
    }
    if (options?.userId) {
      shareData.shared_with_user_id = options.userId
    }
    if (options?.expiresAt) {
      shareData.expires_at = options.expiresAt
    }
    if (options?.createPublicLink) {
      // Generate a random public link
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let link = ''
      for (let i = 0; i < 32; i++) {
        link += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      shareData.public_link = link
      if (options.password) {
        shareData.link_password = options.password
      }
    }

    const { data, error } = await supabase
      .from('document_shares')
      .insert(shareData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to share document: ${error.message}`)
    }

    // Update document's shared status
    await supabase
      .from('documents')
      .update({
        shared_with: [options?.email || options?.userId].filter(Boolean),
        share_count: 1
      })
      .eq('id', documentId)

    toast.success('Document shared', {
      description: options?.createPublicLink
        ? 'Public link created and copied to clipboard'
        : `Shared with ${options?.email || 'user'}`
    })

    // Copy link to clipboard if public link was created
    if (data.public_link) {
      const shareUrl = `${window.location.origin}/documents/share/${data.public_link}`
      navigator.clipboard.writeText(shareUrl).catch(() => {})
    }

    return data
  }

  const updateSharePermissions = async (
    shareId: string,
    updates: {
      permissionLevel?: PermissionLevel
      allowDownload?: boolean
      expiresAt?: string
    }
  ): Promise<DocumentShare> => {
    const { data, error } = await supabase
      .from('document_shares')
      .update({
        permission_level: updates.permissionLevel,
        allow_download: updates.allowDownload,
        expires_at: updates.expiresAt
      })
      .eq('id', shareId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update share permissions: ${error.message}`)
    }

    toast.success('Permissions updated')
    return data
  }

  const revokeShare = async (shareId: string): Promise<void> => {
    const { error } = await supabase
      .from('document_shares')
      .update({ is_active: false })
      .eq('id', shareId)

    if (error) {
      throw new Error(`Failed to revoke share: ${error.message}`)
    }

    toast.success('Share revoked')
  }

  const getDocumentShares = async (documentId: string): Promise<DocumentShare[]> => {
    const { data, error } = await supabase
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .eq('is_active', true)

    if (error) {
      console.error('Failed to get shares:', error)
      return []
    }

    return data || []
  }

  // ============================================
  // VERSION OPERATIONS
  // ============================================

  const uploadNewVersion = async (
    documentId: string,
    file: File,
    changeSummary?: string
  ): Promise<DocumentVersion> => {
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get current document
    const { data: currentDoc, error: docError } = await supabase
      .from('documents')
      .select('version_number, file_path, parent_folder_id')
      .eq('id', documentId)
      .single()

    if (docError || !currentDoc) {
      throw new Error('Document not found')
    }

    const newVersionNumber = (currentDoc.version_number || 1) + 1
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${userId}/${currentDoc.parent_folder_id || 'root'}/v${newVersionNumber}_${timestamp}_${sanitizedFileName}`

    // Upload new file version
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath)

    // Create version record
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersionNumber,
        file_size: file.size,
        storage_path: storagePath,
        change_summary: changeSummary || `Version ${newVersionNumber}`,
        created_by: userId
      })
      .select()
      .single()

    if (versionError) {
      throw new Error(`Failed to create version: ${versionError.message}`)
    }

    // Update document with new version info
    await supabase
      .from('documents')
      .update({
        version_number: newVersionNumber,
        version: `${newVersionNumber}.0`,
        file_size_bytes: file.size,
        file_size_mb: file.size / (1024 * 1024),
        file_path: storagePath,
        file_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    toast.success('New version uploaded', {
      description: `Version ${newVersionNumber} created`
    })

    return version
  }

  const getDocumentVersions = async (documentId: string): Promise<DocumentVersion[]> => {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })

    if (error) {
      console.error('Failed to get versions:', error)
      return []
    }

    return data || []
  }

  const restoreVersion = async (
    documentId: string,
    versionId: string
  ): Promise<Document> => {
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .single()

    if (versionError || !version) {
      throw new Error('Version not found')
    }

    // Get current document
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('version_number')
      .eq('id', documentId)
      .single()

    const newVersionNumber = (currentDoc?.version_number || 1) + 1

    // Create a new version from the restored version
    await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersionNumber,
        file_size: version.file_size,
        storage_path: version.storage_path,
        change_summary: `Restored from version ${version.version_number}`,
        created_by: userId
      })

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(version.storage_path)

    // Update document
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({
        version_number: newVersionNumber,
        version: `${newVersionNumber}.0`,
        file_size_bytes: version.file_size,
        file_path: version.storage_path,
        file_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to restore version: ${updateError.message}`)
    }

    toast.success('Version restored', {
      description: `Restored to version ${version.version_number}`
    })

    return updatedDoc
  }

  // ============================================
  // DOCUMENT ACTIONS
  // ============================================

  const archiveDocument = async (id: string) => {
    return update(id, {
      status: 'archived' as DocumentStatus,
      is_archived: true,
      archived_at: new Date().toISOString()
    })
  }

  const moveToFolder = async (id: string, folderId: string | null, folderPath?: string) => {
    const result = await update(id, {
      parent_folder_id: folderId,
      folder_path: folderPath
    })

    toast.success('Document moved', {
      description: folderId ? `Moved to folder` : 'Moved to root'
    })

    return result
  }

  const starDocument = async (id: string, starred: boolean) => {
    const result = await update(id, { starred } as any)
    toast.success(starred ? 'Added to starred' : 'Removed from starred')
    return result
  }

  const downloadDocument = async (id: string) => {
    // Get document details
    const { data: doc, error } = await supabase
      .from('documents')
      .select('file_path, file_name, document_title')
      .eq('id', id)
      .single()

    if (error || !doc?.file_path) {
      throw new Error('Document not found or no file attached')
    }

    // Get download URL from storage
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60) // 60 seconds expiry

    if (downloadError || !downloadData?.signedUrl) {
      throw new Error('Failed to generate download link')
    }

    // Update download count
    await update(id, {
      download_count: 1,
      last_accessed_at: new Date().toISOString()
    })

    // Trigger download
    const link = document.createElement('a')
    link.href = downloadData.signedUrl
    link.download = doc.file_name || doc.document_title || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Download started', {
      description: `Downloading "${doc.file_name || doc.document_title}"`
    })
  }

  return {
    // Document operations
    createDocument,
    updateDocument,
    deleteDocument,
    uploadDocument,
    downloadDocument,
    archiveDocument,
    moveToFolder,
    starDocument,
    // Folder operations
    createFolder,
    updateFolder,
    deleteFolder,
    getFolders,
    // Share operations
    shareDocument,
    updateSharePermissions,
    revokeShare,
    getDocumentShares,
    // Version operations
    uploadNewVersion,
    getDocumentVersions,
    restoreVersion,
    // Loading state
    loading
  }
}

// Legacy hooks for backwards compatibility
export function useCreateDocument() {
  const { createDocument, loading } = useDocumentMutations()
  return { mutate: createDocument, loading }
}

export function useUpdateDocument() {
  const { updateDocument, loading } = useDocumentMutations()
  return { mutate: updateDocument, loading }
}

export function useDeleteDocument() {
  const { deleteDocument, loading } = useDocumentMutations()
  return { mutate: deleteDocument, loading }
}
