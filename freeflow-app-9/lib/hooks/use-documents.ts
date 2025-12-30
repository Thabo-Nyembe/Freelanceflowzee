'use client'

import { useSupabaseMutation } from './use-supabase-mutation'
import { useSupabaseQuery } from './use-supabase-helpers'

export type DocumentType = 'contract' | 'proposal' | 'report' | 'policy' | 'invoice' | 'presentation' | 'spreadsheet' | 'other'
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived' | 'rejected' | 'published'
export type AccessLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'secret'

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
    return remove(id)
  }

  const shareDocument = async (id: string, sharedWith?: string[]) => {
    return update(id, {
      shared_with: sharedWith || [],
      share_count: 1 // Increment would need server-side logic
    })
  }

  const archiveDocument = async (id: string) => {
    return update(id, {
      status: 'archived' as DocumentStatus,
      is_archived: true,
      archived_at: new Date().toISOString()
    })
  }

  const moveToFolder = async (id: string, folderId: string | null, folderPath?: string) => {
    return update(id, {
      parent_folder_id: folderId,
      folder_path: folderPath
    })
  }

  const starDocument = async (id: string, starred: boolean) => {
    // Note: 'starred' field not in Document interface, but commonly added
    return update(id, { starred } as any)
  }

  const downloadDocument = async (id: string) => {
    // Update download count
    return update(id, {
      download_count: 1, // Would need server-side increment
      last_accessed_at: new Date().toISOString()
    })
  }

  return {
    createDocument,
    updateDocument,
    deleteDocument,
    shareDocument,
    archiveDocument,
    moveToFolder,
    starDocument,
    downloadDocument,
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
