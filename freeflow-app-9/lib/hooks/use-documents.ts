'use client'

import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

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

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('document_type', type)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (department && department !== 'all') {
      query = query.eq('department', department)
    }

    return query
  }

  return useSupabaseQuery<Document>('documents', buildQuery, [type, status, department])
}

export function useCreateDocument() {
  return useSupabaseMutation<Document>('documents', 'insert')
}

export function useUpdateDocument() {
  return useSupabaseMutation<Document>('documents', 'update')
}

export function useDeleteDocument() {
  return useSupabaseMutation<Document>('documents', 'delete')
}
