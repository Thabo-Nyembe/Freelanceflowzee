/**
 * Server Actions for File Management
 *
 * Provides type-safe CRUD operations for files with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Full TypeScript types
 * - Logging and error tracking
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  createFileSchema,
  updateFileSchema,
  uuidSchema,
  CreateFile,
  UpdateFile
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('files-actions')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface File {
  id: string
  user_id: string
  name: string
  original_name: string
  mime_type: string
  size: number
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
  path: string
  url?: string | null
  folder_id?: string | null
  project_id?: string | null
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// ============================================
// FILE ACTIONS
// ============================================

/**
 * Create a new file record
 */
export async function createFile(
  data: CreateFile
): Promise<ActionResult<File>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createFileSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const fileData = validation.data

    // Insert file
    const { data: file, error } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        name: fileData.name,
        original_name: fileData.original_name,
        mime_type: fileData.mime_type,
        size: fileData.size,
        type: fileData.type,
        path: fileData.path,
        url: fileData.url,
        folder_id: fileData.folder_id,
        project_id: fileData.project_id,
        metadata: fileData.metadata
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('File created', { fileId: file.id, fileName: file.name, userId: user.id })
    revalidatePath('/dashboard/files-hub-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(file, 'File created successfully')
  } catch (error) {
    logger.error('Unexpected error creating file', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update a file record
 */
export async function updateFile(
  id: string,
  data: UpdateFile
): Promise<ActionResult<File>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid file ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateFileSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const updateData = validation.data

    // Update file
    const { data: file, error } = await supabase
      .from('files')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update file', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!file) {
      return actionError('File not found or access denied', 'NOT_FOUND')
    }

    logger.info('File updated', { fileId: id, userId: user.id })
    revalidatePath('/dashboard/files-hub-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(file, 'File updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a file (soft delete)
 */
export async function deleteFile(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid file ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Soft delete file
    const { error } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete file', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('File deleted', { fileId: id, userId: user.id })
    revalidatePath('/dashboard/files-hub-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ id }, 'File deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Move file to a folder
 */
export async function moveFileToFolder(
  id: string,
  folderId: string | null
): Promise<ActionResult<File>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid file ID', 'VALIDATION_ERROR')
    }

    // Validate folder ID if provided
    if (folderId !== null) {
      const folderValidation = uuidSchema.safeParse(folderId)
      if (!folderValidation.success) {
        return actionError('Invalid folder ID', 'VALIDATION_ERROR')
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update file
    const { data: file, error } = await supabase
      .from('files')
      .update({ folder_id: folderId })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to move file', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!file) {
      return actionError('File not found or access denied', 'NOT_FOUND')
    }

    logger.info('File moved to folder', { fileId: id, folderId, userId: user.id })
    revalidatePath('/dashboard/files-hub-v2')

    return actionSuccess(file, 'File moved successfully')
  } catch (error) {
    logger.error('Unexpected error moving file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Attach file to project
 */
export async function attachFileToProject(
  id: string,
  projectId: string | null
): Promise<ActionResult<File>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid file ID', 'VALIDATION_ERROR')
    }

    // Validate project ID if provided
    if (projectId !== null) {
      const projectValidation = uuidSchema.safeParse(projectId)
      if (!projectValidation.success) {
        return actionError('Invalid project ID', 'VALIDATION_ERROR')
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update file
    const { data: file, error } = await supabase
      .from('files')
      .update({ project_id: projectId })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to attach file to project', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!file) {
      return actionError('File not found or access denied', 'NOT_FOUND')
    }

    logger.info('File attached to project', { fileId: id, projectId, userId: user.id })
    revalidatePath('/dashboard/files-hub-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(file, 'File attached to project successfully')
  } catch (error) {
    logger.error('Unexpected error attaching file to project', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Bulk delete files
 */
export async function bulkDeleteFiles(
  ids: string[]
): Promise<ActionResult<{ success: boolean; count: number }>> {
  const supabase = await createClient()

  try {
    // Validate IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return actionError('Invalid file IDs array', 'VALIDATION_ERROR')
    }

    for (const id of ids) {
      const validation = uuidSchema.safeParse(id)
      if (!validation.success) {
        return actionError('Invalid file ID in array', 'VALIDATION_ERROR')
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Bulk delete
    const { error } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to bulk delete files', { error: error.message, count: ids.length, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Files bulk deleted', { count: ids.length, userId: user.id })
    revalidatePath('/dashboard/files-hub-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ success: true, count: ids.length }, `${ids.length} files deleted`)
  } catch (error) {
    logger.error('Unexpected error bulk deleting files', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get files by folder
 */
export async function getFilesByFolder(
  folderId: string
): Promise<ActionResult<File[]>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(folderId)
    if (!idValidation.success) {
      return actionError('Invalid folder ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get files
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('folder_id', folderId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get files by folder', { error: error.message, folderId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Files retrieved by folder', { folderId, count: files?.length || 0, userId: user.id })

    return actionSuccess(files || [], 'Files retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting files by folder', { error, folderId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get files by project
 */
export async function getFilesByProject(
  projectId: string
): Promise<ActionResult<File[]>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(projectId)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get files
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get files by project', { error: error.message, projectId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Files retrieved by project', { projectId, count: files?.length || 0, userId: user.id })

    return actionSuccess(files || [], 'Files retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting files by project', { error, projectId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Search files
 */
export async function searchFiles(
  query: string,
  options?: { type?: string; folderId?: string; projectId?: string }
): Promise<ActionResult<File[]>> {
  const supabase = await createClient()

  try {
    // Validate query
    const queryValidation = z.string().min(1).max(500).safeParse(query)
    if (!queryValidation.success) {
      return actionError('Invalid search query', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let queryBuilder = supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,original_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (options?.type) {
      queryBuilder = queryBuilder.eq('type', options.type)
    }

    if (options?.folderId) {
      queryBuilder = queryBuilder.eq('folder_id', options.folderId)
    }

    if (options?.projectId) {
      queryBuilder = queryBuilder.eq('project_id', options.projectId)
    }

    const { data: files, error } = await queryBuilder.limit(50)

    if (error) {
      logger.error('Failed to search files', { error: error.message, query, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Files search completed', { query, results: files?.length || 0, userId: user.id })

    return actionSuccess(files || [], 'Search completed successfully')
  } catch (error) {
    logger.error('Unexpected error searching files', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
