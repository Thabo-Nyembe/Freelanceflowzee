'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('documents')

// Types
interface CreateDocumentInput {
  document_title: string
  document_type: string
  access_level?: string
  department?: string
  owner?: string
}

interface UpdateDocumentStatusInput {
  id: string
  status: string
  notes?: string
}

interface DocumentUpdateData {
  status: string
  last_modified_by: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  notes?: string
}

interface FileUpload {
  url: string
  name: string
  size: number
  type: string
}

interface Document {
  id: string
  user_id: string
  document_title: string
  document_type: string
  access_level?: string
  department?: string
  owner?: string
  created_by: string
  status: string
  version: string
  version_number: number
  file_url?: string
  file_name?: string
  file_size_bytes?: number
  file_size_mb?: number
  file_extension?: string
  mime_type?: string
  view_count?: number
  unique_viewers?: number
  download_count?: number
  share_count?: number
  shared_with?: string[]
  last_accessed_at?: string
  version_notes?: string
  is_latest_version?: boolean
  previous_version_id?: string
  created_at?: string
  updated_at?: string
}

interface ViewCountData {
  view_count: number
  unique_viewers: number
}

interface DownloadCountData {
  download_count: number
}

interface ShareCountData {
  share_count: number
}

interface VersionData {
  version_number: number
}

export async function createDocument(data: CreateDocumentInput): Promise<ActionResult<Document>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        ...data,
        created_by: user.email || 'Unknown',
        status: 'draft',
        version: '1.0',
        version_number: 1
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create document', { error, userId: user.id })
      return actionError('Failed to create document', 'DATABASE_ERROR')
    }

    logger.info('Document created successfully', { documentId: document.id, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, 'Document created successfully')
  } catch (error) {
    logger.error('Unexpected error creating document', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDocumentStatus(
  id: string,
  status: string,
  notes?: string
): Promise<ActionResult<Document>> {
  try {
    // Validate document ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid document ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document status update attempt', { documentId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const updateData: DocumentUpdateData = {
      status,
      last_modified_by: user.email || 'Unknown'
    }

    if (status === 'approved') {
      updateData.approved_by = user.email || 'Unknown'
      updateData.approved_at = new Date().toISOString()
    }

    if (status === 'review') {
      updateData.reviewed_by = user.email || 'Unknown'
      updateData.reviewed_at = new Date().toISOString()
    }

    if (notes) {
      updateData.notes = notes
    }

    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update document status', { error, documentId: id, userId: user.id })
      return actionError('Failed to update document status', 'DATABASE_ERROR')
    }

    if (!document) {
      logger.warn('Document not found or access denied', { documentId: id, userId: user.id })
      return actionError('Document not found', 'NOT_FOUND')
    }

    logger.info('Document status updated successfully', { documentId: id, status, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, 'Document status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating document status', { error, documentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordDocumentView(
  id: string,
  isUnique: boolean = false
): Promise<ActionResult<Document>> {
  try {
    // Validate document ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid document ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document view attempt', { documentId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('documents')
      .select('view_count, unique_viewers')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Document not found for view recording', { documentId: id, userId: user.id })
      return actionError('Document not found', 'NOT_FOUND')
    }

    const typedCurrent = current as ViewCountData

    const updateData = {
      view_count: (typedCurrent.view_count || 0) + 1,
      last_accessed_at: new Date().toISOString(),
      ...(isUnique && { unique_viewers: (typedCurrent.unique_viewers || 0) + 1 })
    }

    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record document view', { error, documentId: id, userId: user.id })
      return actionError('Failed to record document view', 'DATABASE_ERROR')
    }

    logger.info('Document view recorded', { documentId: id, isUnique, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, 'View recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording document view', { error, documentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordDocumentDownload(id: string): Promise<ActionResult<Document>> {
  try {
    // Validate document ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid document ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document download attempt', { documentId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('documents')
      .select('download_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Document not found for download recording', { documentId: id, userId: user.id })
      return actionError('Document not found', 'NOT_FOUND')
    }

    const typedCurrent = current as DownloadCountData

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        download_count: (typedCurrent.download_count || 0) + 1
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record document download', { error, documentId: id, userId: user.id })
      return actionError('Failed to record document download', 'DATABASE_ERROR')
    }

    logger.info('Document download recorded', { documentId: id, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, 'Download recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording document download', { error, documentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function shareDocument(
  id: string,
  sharedWith: string[]
): Promise<ActionResult<Document>> {
  try {
    // Validate document ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid document ID format', 'VALIDATION_ERROR')
    }

    if (!Array.isArray(sharedWith)) {
      return actionError('Invalid shared_with format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document share attempt', { documentId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('documents')
      .select('share_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Document not found for sharing', { documentId: id, userId: user.id })
      return actionError('Document not found', 'NOT_FOUND')
    }

    const typedCurrent = current as ShareCountData

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        shared_with: sharedWith,
        share_count: (typedCurrent.share_count || 0) + 1
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to share document', { error, documentId: id, userId: user.id })
      return actionError('Failed to share document', 'DATABASE_ERROR')
    }

    logger.info('Document shared successfully', { documentId: id, sharedWith: sharedWith.length, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, 'Document shared successfully')
  } catch (error) {
    logger.error('Unexpected error sharing document', { error, documentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function uploadDocument(
  id: string,
  file: FileUpload
): Promise<ActionResult<Document>> {
  try {
    // Validate document ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid document ID format', 'VALIDATION_ERROR')
    }

    if (!file.url || !file.name || typeof file.size !== 'number') {
      return actionError('Invalid file data', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document upload attempt', { documentId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2))
    const extension = file.name.split('.').pop() || ''

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        file_url: file.url,
        file_name: file.name,
        file_size_bytes: file.size,
        file_size_mb: fileSizeMB,
        file_extension: extension,
        mime_type: file.type
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to upload document file', { error, documentId: id, userId: user.id })
      return actionError('Failed to upload document file', 'DATABASE_ERROR')
    }

    if (!document) {
      logger.warn('Document not found for upload', { documentId: id, userId: user.id })
      return actionError('Document not found', 'NOT_FOUND')
    }

    logger.info('Document file uploaded successfully', { documentId: id, fileName: file.name, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, 'File uploaded successfully')
  } catch (error) {
    logger.error('Unexpected error uploading document', { error, documentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createNewVersion(
  id: string,
  versionNotes: string
): Promise<ActionResult<Document>> {
  try {
    // Validate document ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid document ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized document version creation attempt', { documentId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('documents')
      .select('version_number')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Document not found for version creation', { documentId: id, userId: user.id })
      return actionError('Document not found', 'NOT_FOUND')
    }

    const typedCurrent = current as VersionData

    const newVersionNumber = (typedCurrent.version_number || 0) + 1
    const newVersion = `${Math.floor(newVersionNumber / 10)}.${newVersionNumber % 10}`

    // Mark current version as not latest
    const { error: updateError } = await supabase
      .from('documents')
      .update({ is_latest_version: false })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Failed to update previous version', { error: updateError, documentId: id, userId: user.id })
      return actionError('Failed to update previous version', 'DATABASE_ERROR')
    }

    // Create new version (this would typically create a new document record)
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        version_number: newVersionNumber,
        version: newVersion,
        version_notes: versionNotes,
        is_latest_version: true,
        previous_version_id: id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create document version', { error, documentId: id, userId: user.id })
      return actionError('Failed to create document version', 'DATABASE_ERROR')
    }

    logger.info('Document version created successfully', { documentId: id, version: newVersion, userId: user.id })
    revalidatePath('/dashboard/documents-v2')
    return actionSuccess(document as Document, `Version ${newVersion} created successfully`)
  } catch (error) {
    logger.error('Unexpected error creating document version', { error, documentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
