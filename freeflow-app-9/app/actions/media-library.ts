/**
 * Server Actions for Media Library Management
 *
 * Provides type-safe CRUD operations for media files and folders with:
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
import type { FileType, FileStatus, AccessLevel } from '@/lib/hooks/use-media-library'
import { uuidSchema } from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('media-library-actions')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const fileTypeSchema = z.enum(['image', 'video', 'audio', 'document', 'other'])
const fileStatusSchema = z.enum(['active', 'archived', 'processing', 'failed'])
const accessLevelSchema = z.enum(['private', 'public', 'shared'])

const createMediaFileSchema = z.object({
  file_name: z.string().min(1).max(255),
  original_name: z.string().max(255).optional(),
  file_type: fileTypeSchema,
  mime_type: z.string().max(100).optional(),
  file_extension: z.string().max(20).optional(),
  storage_path: z.string().max(1000).optional(),
  storage_url: z.string().url().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  file_size: z.number().int().min(0).optional(),
  width: z.number().int().min(0).optional(),
  height: z.number().int().min(0).optional(),
  duration_seconds: z.number().min(0).optional(),
  folder_id: uuidSchema.optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  description: z.string().max(2000).optional()
})

const updateMediaFileSchema = z.object({
  file_name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  alt_text: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  folder_id: uuidSchema.optional().nullable(),
  is_starred: z.boolean().optional(),
  is_public: z.boolean().optional(),
  access_level: accessLevelSchema.optional()
}).partial()

const createMediaFolderSchema = z.object({
  folder_name: z.string().min(1).max(255),
  parent_id: uuidSchema.optional().nullable(),
  description: z.string().max(1000).optional(),
  color: z.string().max(50).optional(),
  icon: z.string().max(50).optional()
})

const updateMediaFolderSchema = z.object({
  folder_name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  color: z.string().max(50).optional(),
  icon: z.string().max(50).optional(),
  is_starred: z.boolean().optional(),
  sort_order: z.number().int().optional()
}).partial()

const searchMediaSchema = z.object({
  query: z.string().min(1).max(500),
  fileType: fileTypeSchema.optional(),
  folderId: uuidSchema.optional()
})

// ============================================
// TYPE DEFINITIONS
// ============================================

interface MediaFile {
  id: string
  user_id: string
  file_name: string
  original_name?: string
  file_type: FileType
  mime_type?: string
  file_extension?: string
  storage_path?: string
  storage_url?: string
  thumbnail_url?: string
  file_size: number
  width?: number
  height?: number
  duration_seconds?: number
  folder_id?: string | null
  tags?: string[]
  description?: string
  status: FileStatus
  is_starred?: boolean
  is_public?: boolean
  access_level?: AccessLevel
  view_count?: number
  download_count?: number
  uploaded_at: string
  deleted_at?: string | null
}

interface MediaFolder {
  id: string
  user_id: string
  folder_name: string
  folder_path: string
  parent_id?: string | null
  description?: string
  color?: string
  icon?: string
  is_starred?: boolean
  sort_order?: number
  file_count: number
  folder_count: number
  total_size: number
  deleted_at?: string | null
}

// ============================================
// MEDIA FILE ACTIONS
// ============================================

/**
 * Create a new media file
 */
export async function createMediaFile(
  data: z.infer<typeof createMediaFileSchema>
): Promise<ActionResult<MediaFile>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createMediaFileSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const fileData = validation.data

    // Insert file
    const { data: file, error } = await supabase
      .from('media_files')
      .insert({
        user_id: user.id,
        file_name: fileData.file_name,
        original_name: fileData.original_name || fileData.file_name,
        file_type: fileData.file_type,
        mime_type: fileData.mime_type,
        file_extension: fileData.file_extension,
        storage_path: fileData.storage_path,
        storage_url: fileData.storage_url,
        thumbnail_url: fileData.thumbnail_url,
        file_size: fileData.file_size || 0,
        width: fileData.width,
        height: fileData.height,
        duration_seconds: fileData.duration_seconds,
        folder_id: fileData.folder_id,
        tags: fileData.tags,
        description: fileData.description,
        status: 'active',
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create media file', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update folder stats if in a folder
    if (fileData.folder_id) {
      await updateFolderStatsInternal(fileData.folder_id)
    }

    logger.info('Media file created', { fileId: file.id, fileName: file.file_name, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess(file, 'File uploaded successfully')
  } catch (error) {
    logger.error('Unexpected error creating media file', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update a media file
 */
export async function updateMediaFile(
  id: string,
  updates: z.infer<typeof updateMediaFileSchema>
): Promise<ActionResult<MediaFile>> {
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
    const validation = updateMediaFileSchema.safeParse(updates)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Get current folder before update
    const { data: currentFile } = await supabase
      .from('media_files')
      .select('folder_id')
      .eq('id', id)
      .single()

    const updateData = validation.data

    // Update file
    const { data: file, error } = await supabase
      .from('media_files')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update media file', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!file) {
      return actionError('File not found or access denied', 'NOT_FOUND')
    }

    // Update folder stats if folder changed
    if (currentFile?.folder_id !== updateData.folder_id) {
      if (currentFile?.folder_id) {
        await updateFolderStatsInternal(currentFile.folder_id)
      }
      if (updateData.folder_id) {
        await updateFolderStatsInternal(updateData.folder_id)
      }
    }

    logger.info('Media file updated', { fileId: id, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess(file, 'File updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating media file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Move file to a folder
 */
export async function moveFile(
  id: string,
  folderId: string | null
): Promise<ActionResult<MediaFile>> {
  return updateMediaFile(id, { folder_id: folderId })
}

/**
 * Star/unstar a file
 */
export async function starFile(
  id: string,
  starred: boolean
): Promise<ActionResult<MediaFile>> {
  return updateMediaFile(id, { is_starred: starred })
}

/**
 * Set file public/private
 */
export async function setFilePublic(
  id: string,
  isPublic: boolean
): Promise<ActionResult<MediaFile>> {
  return updateMediaFile(id, { is_public: isPublic })
}

/**
 * Increment file view count
 */
export async function incrementFileView(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid file ID', 'VALIDATION_ERROR')
    }

    const { data: file, error: fetchError } = await supabase
      .from('media_files')
      .select('view_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch file for view increment', { error: fetchError.message, fileId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const { error } = await supabase
      .from('media_files')
      .update({ view_count: (file.view_count || 0) + 1 })
      .eq('id', id)

    if (error) {
      logger.error('Failed to increment view count', { error: error.message, fileId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess({ success: true }, 'View count incremented')
  } catch (error) {
    logger.error('Unexpected error incrementing view count', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Increment file download count
 */
export async function incrementFileDownload(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid file ID', 'VALIDATION_ERROR')
    }

    const { data: file, error: fetchError } = await supabase
      .from('media_files')
      .select('download_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch file for download increment', { error: fetchError.message, fileId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const { error } = await supabase
      .from('media_files')
      .update({ download_count: (file.download_count || 0) + 1 })
      .eq('id', id)

    if (error) {
      logger.error('Failed to increment download count', { error: error.message, fileId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess({ success: true }, 'Download count incremented')
  } catch (error) {
    logger.error('Unexpected error incrementing download count', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Archive a file
 */
export async function archiveFile(
  id: string
): Promise<ActionResult<MediaFile>> {
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

    const { data: file, error } = await supabase
      .from('media_files')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive file', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!file) {
      return actionError('File not found or access denied', 'NOT_FOUND')
    }

    logger.info('File archived', { fileId: id, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess(file, 'File archived successfully')
  } catch (error) {
    logger.error('Unexpected error archiving file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a media file (soft delete)
 */
export async function deleteMediaFile(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
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

    // Get folder before delete
    const { data: file } = await supabase
      .from('media_files')
      .select('folder_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('media_files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete file', { error: error.message, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update folder stats
    if (file?.folder_id) {
      await updateFolderStatsInternal(file.folder_id)
    }

    logger.info('File deleted', { fileId: id, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess({ success: true }, 'File deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting file', { error, fileId: id })
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

    // Get folders before delete
    const { data: files } = await supabase
      .from('media_files')
      .select('folder_id')
      .in('id', ids)

    const { error } = await supabase
      .from('media_files')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to bulk delete files', { error: error.message, count: ids.length, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update folder stats
    const folderIds = [...new Set(files?.map(f => f.folder_id).filter(Boolean) as string[])]
    for (const folderId of folderIds) {
      await updateFolderStatsInternal(folderId)
    }

    logger.info('Files bulk deleted', { count: ids.length, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess({ success: true, count: ids.length }, `${ids.length} files deleted`)
  } catch (error) {
    logger.error('Unexpected error bulk deleting files', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// MEDIA FOLDER ACTIONS
// ============================================

/**
 * Create a new media folder
 */
export async function createMediaFolder(
  data: z.infer<typeof createMediaFolderSchema>
): Promise<ActionResult<MediaFolder>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createMediaFolderSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const folderData = validation.data

    // Build folder path
    let folderPath = `/${folderData.folder_name}`
    if (folderData.parent_id) {
      const { data: parent } = await supabase
        .from('media_folders')
        .select('folder_path')
        .eq('id', folderData.parent_id)
        .single()

      if (parent?.folder_path) {
        folderPath = `${parent.folder_path}/${folderData.folder_name}`
      }
    }

    // Insert folder
    const { data: folder, error } = await supabase
      .from('media_folders')
      .insert({
        user_id: user.id,
        folder_name: folderData.folder_name,
        folder_path: folderPath,
        parent_id: folderData.parent_id,
        description: folderData.description,
        color: folderData.color,
        icon: folderData.icon
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create folder', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update parent folder count
    if (folderData.parent_id) {
      await updateFolderStatsInternal(folderData.parent_id)
    }

    logger.info('Folder created', { folderId: folder.id, folderName: folder.folder_name, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess(folder, 'Folder created successfully')
  } catch (error) {
    logger.error('Unexpected error creating folder', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update a media folder
 */
export async function updateMediaFolder(
  id: string,
  updates: z.infer<typeof updateMediaFolderSchema>
): Promise<ActionResult<MediaFolder>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid folder ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateMediaFolderSchema.safeParse(updates)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const updateData = validation.data

    // Update folder
    const { data: folder, error } = await supabase
      .from('media_folders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update folder', { error: error.message, folderId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!folder) {
      return actionError('Folder not found or access denied', 'NOT_FOUND')
    }

    logger.info('Folder updated', { folderId: id, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess(folder, 'Folder updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating folder', { error, folderId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Star/unstar a folder
 */
export async function starFolder(
  id: string,
  starred: boolean
): Promise<ActionResult<MediaFolder>> {
  return updateMediaFolder(id, { is_starred: starred })
}

/**
 * Move folder to a new parent
 */
export async function moveFolder(
  id: string,
  parentId: string | null
): Promise<ActionResult<MediaFolder>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid folder ID', 'VALIDATION_ERROR')
    }

    // Validate parent ID if provided
    if (parentId !== null) {
      const parentValidation = uuidSchema.safeParse(parentId)
      if (!parentValidation.success) {
        return actionError('Invalid parent folder ID', 'VALIDATION_ERROR')
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current folder
    const { data: folder } = await supabase
      .from('media_folders')
      .select('parent_id, folder_name')
      .eq('id', id)
      .single()

    if (!folder) {
      return actionError('Folder not found or access denied', 'NOT_FOUND')
    }

    // Build new path
    let folderPath = `/${folder.folder_name}`
    if (parentId) {
      const { data: parent } = await supabase
        .from('media_folders')
        .select('folder_path')
        .eq('id', parentId)
        .single()

      if (parent?.folder_path) {
        folderPath = `${parent.folder_path}/${folder.folder_name}`
      }
    }

    // Update folder
    const { data: updatedFolder, error } = await supabase
      .from('media_folders')
      .update({
        parent_id: parentId,
        folder_path: folderPath
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to move folder', { error: error.message, folderId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update old and new parent stats
    if (folder.parent_id) {
      await updateFolderStatsInternal(folder.parent_id)
    }
    if (parentId) {
      await updateFolderStatsInternal(parentId)
    }

    logger.info('Folder moved', { folderId: id, newParentId: parentId, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess(updatedFolder, 'Folder moved successfully')
  } catch (error) {
    logger.error('Unexpected error moving folder', { error, folderId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a media folder (soft delete)
 */
export async function deleteMediaFolder(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid folder ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get parent before delete
    const { data: folder } = await supabase
      .from('media_folders')
      .select('parent_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('media_folders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete folder', { error: error.message, folderId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update parent stats
    if (folder?.parent_id) {
      await updateFolderStatsInternal(folder.parent_id)
    }

    logger.info('Folder deleted', { folderId: id, userId: user.id })
    revalidatePath('/dashboard/media-library-v2')

    return actionSuccess({ success: true }, 'Folder deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting folder', { error, folderId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Internal function to update folder statistics
 */
async function updateFolderStatsInternal(folderId: string): Promise<void> {
  const supabase = await createClient()

  try {
    // Get file count and total size
    const { data: files } = await supabase
      .from('media_files')
      .select('file_size')
      .eq('folder_id', folderId)
      .is('deleted_at', null)

    // Get subfolder count
    const { data: subfolders } = await supabase
      .from('media_folders')
      .select('id')
      .eq('parent_id', folderId)
      .is('deleted_at', null)

    const fileCount = files?.length || 0
    const totalSize = files?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0
    const folderCount = subfolders?.length || 0

    await supabase
      .from('media_folders')
      .update({
        file_count: fileCount,
        folder_count: folderCount,
        total_size: totalSize
      })
      .eq('id', folderId)
  } catch (error) {
    logger.error('Failed to update folder stats', { error, folderId })
  }
}

// ============================================
// STATS & SEARCH
// ============================================

/**
 * Get media library statistics
 */
export async function getMediaStats(): Promise<ActionResult<{
  totalFiles: number
  totalFolders: number
  totalSize: number
  totalViews: number
  totalDownloads: number
  byType: Record<string, number>
}>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: files } = await supabase
      .from('media_files')
      .select('file_type, file_size, view_count, download_count')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    const { data: folders } = await supabase
      .from('media_folders')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const totalFiles = files?.length || 0
    const totalFolders = folders?.length || 0
    const totalSize = files?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0
    const totalViews = files?.reduce((sum, f) => sum + (f.view_count || 0), 0) || 0
    const totalDownloads = files?.reduce((sum, f) => sum + (f.download_count || 0), 0) || 0

    const byType = {
      images: files?.filter(f => f.file_type === 'image').length || 0,
      videos: files?.filter(f => f.file_type === 'video').length || 0,
      audio: files?.filter(f => f.file_type === 'audio').length || 0,
      documents: files?.filter(f => f.file_type === 'document').length || 0
    }

    const stats = {
      totalFiles,
      totalFolders,
      totalSize,
      totalViews,
      totalDownloads,
      byType
    }

    logger.info('Media stats retrieved', { userId: user.id })

    return actionSuccess(stats, 'Stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting media stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Search media files
 */
export async function searchMedia(
  query: string,
  options?: { fileType?: FileType; folderId?: string }
): Promise<ActionResult<MediaFile[]>> {
  const supabase = await createClient()

  try {
    // Validate input
    const validation = searchMediaSchema.safeParse({ query, ...options })
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let queryBuilder = supabase
      .from('media_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .or(`file_name.ilike.%${query}%,original_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('uploaded_at', { ascending: false })

    if (options?.fileType) {
      queryBuilder = queryBuilder.eq('file_type', options.fileType)
    }

    if (options?.folderId) {
      queryBuilder = queryBuilder.eq('folder_id', options.folderId)
    }

    const { data, error } = await queryBuilder.limit(50)

    if (error) {
      logger.error('Failed to search media', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Media search completed', { query, results: data?.length || 0, userId: user.id })

    return actionSuccess(data || [], 'Search completed successfully')
  } catch (error) {
    logger.error('Unexpected error searching media', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
