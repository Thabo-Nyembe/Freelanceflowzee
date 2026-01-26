/**
 * Files Hub Queries
 *
 * Supabase queries for file management system
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from './logger'
import { DatabaseError, toDbError } from '@/lib/types/database'

const supabase = createClient()
const logger = createFeatureLogger('FilesHub')

// TypeScript interfaces
export interface File {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other'
  extension: string
  size: number
  url: string
  storage_provider: 'supabase' | 'wasabi' | 'aws-s3' | 'google-cloud' | 'azure'
  mime_type: string | null
  status: 'active' | 'archived' | 'deleted' | 'processing' | 'failed'
  access_level: 'private' | 'team' | 'public' | 'restricted'
  is_starred: boolean
  is_shared: boolean
  downloads: number
  views: number
  uploaded_at: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  path: string
  description: string | null
  icon: string | null
  color: string | null
  file_count: number
  total_size: number
  can_read: boolean
  can_write: boolean
  can_delete: boolean
  can_share: boolean
  is_shared: boolean
  shared_with: string[]
  created_at: string
  updated_at: string
}

export interface FileFilters {
  type?: File['type']
  status?: File['status']
  folder_id?: string
  search?: string
  is_starred?: boolean
  is_shared?: boolean
}

export interface FileSortOptions {
  field: 'name' | 'size' | 'uploaded_at' | 'updated_at' | 'downloads' | 'views'
  ascending?: boolean
}

export interface FileStats {
  total: number
  documents: number
  images: number
  videos: number
  audio: number
  archives: number
  other: number
  totalSize: number
  starred: number
  shared: number
  archived: number
}

/**
 * Get all files for a user with optional filters and sorting
 */
export async function getFiles(
  userId: string,
  filters?: FileFilters,
  sort?: FileSortOptions,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: File[]; error: DatabaseError | null; count: number }> {
  logger.info('Fetching files', { userId, filters, sort, limit, offset })

  try {
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.folder_id) {
      query = query.eq('folder_id', filters.folder_id)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters?.is_starred !== undefined) {
      query = query.eq('is_starred', filters.is_starred)
    }
    if (filters?.is_shared !== undefined) {
      query = query.eq('is_shared', filters.is_shared)
    }

    // Apply sorting
    const sortField = sort?.field || 'uploaded_at'
    const ascending = sort?.ascending ?? false
    query = query.order(sortField, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      logger.error('Failed to fetch files', { error, userId })
      return { data: [], error: toDbError(error), count: 0 }
    }

    logger.info('Files fetched successfully', {
      count: data?.length || 0,
      totalCount: count,
      userId,
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error: unknown) {
    logger.error('Exception fetching files', { error, userId })
    return { data: [], error: toDbError(error), count: 0 }
  }
}

/**
 * Get a single file by ID
 */
export async function getFile(
  fileId: string
): Promise<{ data: File | null; error: DatabaseError | null }> {
  logger.info('Fetching file', { fileId })

  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (error) {
      logger.error('Failed to fetch file', { error, fileId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('File fetched successfully', { fileId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching file', { error, fileId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a new file
 */
export async function createFile(
  userId: string,
  fileData: Partial<File>
): Promise<{ data: File | null; error: DatabaseError | null }> {
  logger.info('Creating file', { userId, name: fileData.name })

  try {
    const { data, error } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        folder_id: fileData.folder_id,
        name: fileData.name,
        type: fileData.type,
        extension: fileData.extension,
        size: fileData.size,
        url: fileData.url,
        storage_provider: fileData.storage_provider || 'supabase',
        mime_type: fileData.mime_type,
        status: fileData.status || 'active',
        access_level: fileData.access_level || 'private',
        is_starred: false,
        is_shared: false,
        downloads: 0,
        views: 0,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('File created successfully', {
      fileId: data.id,
      name: data.name,
      userId,
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating file', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a file
 */
export async function updateFile(
  fileId: string,
  updates: Partial<File>
): Promise<{ data: File | null; error: DatabaseError | null }> {
  logger.info('Updating file', { fileId, updates })

  try {
    const { data, error } = await supabase
      .from('files')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update file', { error, fileId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('File updated successfully', { fileId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating file', { error, fileId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a file (soft delete)
 */
export async function deleteFile(
  fileId: string
): Promise<{ error: DatabaseError | null }> {
  logger.info('Deleting file', { fileId })

  try {
    const { error } = await supabase
      .from('files')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', fileId)

    if (error) {
      logger.error('Failed to delete file', { error, fileId })
      return { error: toDbError(error) }
    }

    logger.info('File deleted successfully', { fileId })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting file', { error, fileId })
    return { error: toDbError(error) }
  }
}

/**
 * Permanently delete a file
 */
export async function permanentlyDeleteFile(
  fileId: string
): Promise<{ error: DatabaseError | null }> {
  logger.info('Permanently deleting file', { fileId })

  try {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (error) {
      logger.error('Failed to permanently delete file', { error, fileId })
      return { error: toDbError(error) }
    }

    logger.info('File permanently deleted', { fileId })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception permanently deleting file', { error, fileId })
    return { error: toDbError(error) }
  }
}

/**
 * Bulk delete files
 */
export async function bulkDeleteFiles(
  fileIds: string[]
): Promise<{ error: DatabaseError | null }> {
  logger.info('Bulk deleting files', { count: fileIds.length })

  try {
    const { error } = await supabase
      .from('files')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .in('id', fileIds)

    if (error) {
      logger.error('Failed to bulk delete files', { error, count: fileIds.length })
      return { error: toDbError(error) }
    }

    logger.info('Files bulk deleted successfully', { count: fileIds.length })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception bulk deleting files', { error })
    return { error: toDbError(error) }
  }
}

/**
 * Toggle file star status
 */
export async function toggleFileStar(
  fileId: string,
  starred: boolean
): Promise<{ error: DatabaseError | null }> {
  logger.info('Toggling file star', { fileId, starred })

  try {
    const { error } = await supabase
      .from('files')
      .update({ is_starred: starred, updated_at: new Date().toISOString() })
      .eq('id', fileId)

    if (error) {
      logger.error('Failed to toggle file star', { error, fileId })
      return { error: toDbError(error) }
    }

    logger.info('File star toggled successfully', { fileId, starred })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception toggling file star', { error, fileId })
    return { error: toDbError(error) }
  }
}

/**
 * Move file to folder
 */
export async function moveFileToFolder(
  fileId: string,
  folderId: string | null
): Promise<{ error: DatabaseError | null }> {
  logger.info('Moving file to folder', { fileId, folderId })

  try {
    const { error } = await supabase
      .from('files')
      .update({ folder_id: folderId, updated_at: new Date().toISOString() })
      .eq('id', fileId)

    if (error) {
      logger.error('Failed to move file', { error, fileId, folderId })
      return { error: toDbError(error) }
    }

    logger.info('File moved successfully', { fileId, folderId })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception moving file', { error, fileId, folderId })
    return { error: toDbError(error) }
  }
}

/**
 * Increment file downloads
 */
export async function incrementFileDownloads(
  fileId: string
): Promise<{ error: DatabaseError | null }> {
  logger.info('Incrementing file downloads', { fileId })

  try {
    const { data: file } = await supabase
      .from('files')
      .select('downloads')
      .eq('id', fileId)
      .single()

    if (file) {
      const { error } = await supabase
        .from('files')
        .update({ downloads: (file.downloads || 0) + 1 })
        .eq('id', fileId)

      if (error) {
        logger.error('Failed to increment downloads', { error, fileId })
        return { error: toDbError(error) }
      }

      logger.info('File downloads incremented', { fileId })
      return { error: null }
    }

    return { error: toDbError(new Error('File not found')) }
  } catch (error: unknown) {
    logger.error('Exception incrementing downloads', { error, fileId })
    return { error: toDbError(error) }
  }
}

/**
 * Increment file views
 */
export async function incrementFileViews(
  fileId: string
): Promise<{ error: DatabaseError | null }> {
  logger.info('Incrementing file views', { fileId })

  try {
    const { data: file } = await supabase
      .from('files')
      .select('views')
      .eq('id', fileId)
      .single()

    if (file) {
      const { error } = await supabase
        .from('files')
        .update({ views: (file.views || 0) + 1 })
        .eq('id', fileId)

      if (error) {
        logger.error('Failed to increment views', { error, fileId })
        return { error: toDbError(error) }
      }

      logger.info('File views incremented', { fileId })
      return { error: null }
    }

    return { error: toDbError(new Error('File not found')) }
  } catch (error: unknown) {
    logger.error('Exception incrementing views', { error, fileId })
    return { error: toDbError(error) }
  }
}

/**
 * Get file statistics for a user
 */
export async function getFileStats(userId: string): Promise<FileStats> {
  logger.info('Fetching file statistics', { userId })

  try {
    const { data, error } = await supabase
      .from('files')
      .select('type, size, is_starred, is_shared')
      .eq('user_id', userId)

    if (error) throw error

    const stats: FileStats = {
      total: data?.length || 0,
      documents: data?.filter((f) => f.type === 'document').length || 0,
      images: data?.filter((f) => f.type === 'image').length || 0,
      videos: data?.filter((f) => f.type === 'video').length || 0,
      audio: data?.filter((f) => f.type === 'audio').length || 0,
      archives: data?.filter((f) => f.type === 'archive').length || 0,
      other: data?.filter((f) => f.type === 'other').length || 0,
      totalSize: data?.reduce((sum, f) => sum + (f.size || 0), 0) || 0,
      starred: data?.filter((f) => f.is_starred).length || 0,
      shared: data?.filter((f) => f.is_shared).length || 0,
      archived: 0, // Archived status not tracked in database
    }

    logger.info('File statistics fetched', { stats, userId })
    return stats
  } catch (error: unknown) {
    logger.error('Failed to fetch file statistics', { error, userId })
    return {
      total: 0,
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      other: 0,
      totalSize: 0,
      starred: 0,
      shared: 0,
      archived: 0,
    }
  }
}

/**
 * Search files
 */
export async function searchFiles(
  userId: string,
  searchTerm: string,
  limit: number = 20
): Promise<{ data: File[]; error: DatabaseError | null }> {
  logger.info('Searching files', { userId, searchTerm, limit })

  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`)
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to search files', { error, userId, searchTerm })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Files search completed', {
      resultsCount: data?.length || 0,
      searchTerm,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception searching files', { error, userId, searchTerm })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get recent files
 */
export async function getRecentFiles(
  userId: string,
  limit: number = 10
): Promise<{ data: File[]; error: DatabaseError | null }> {
  logger.info('Fetching recent files', { userId, limit })

  try {
    const { data, error} = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch recent files', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Recent files fetched', { count: data?.length || 0, userId })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching recent files', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get folders for a user
 */
export async function getFolders(
  userId: string
): Promise<{ data: Folder[]; error: DatabaseError | null }> {
  logger.info('Fetching folders', { userId })

  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to fetch folders', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Folders fetched', { count: data?.length || 0, userId })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching folders', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Create a new folder
 */
export async function createFolder(
  userId: string,
  folderData: Partial<Folder>
): Promise<{ data: Folder | null; error: DatabaseError | null }> {
  logger.info('Creating folder', { userId, name: folderData.name })

  try {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        parent_id: folderData.parent_id,
        name: folderData.name,
        path: folderData.path || `/${folderData.name}`,
        description: folderData.description,
        icon: folderData.icon,
        color: folderData.color,
        file_count: 0,
        total_size: 0,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create folder', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Folder created successfully', {
      folderId: data.id,
      name: data.name,
      userId,
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating folder', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}
