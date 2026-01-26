/**
 * Collaboration Workspace Queries
 *
 * Complete CRUD operations for workspace file management:
 * - Folders (hierarchical structure)
 * - Files (with versioning)
 * - File sharing with permissions
 * - Favorites and organization
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

const logger = createFeatureLogger('CollaborationWorkspace')

// ============================================================================
// TYPES
// ============================================================================

export type FileVisibility = 'private' | 'team' | 'public'

export interface WorkspaceFolder {
  id: string
  user_id: string
  name: string
  description: string | null
  parent_folder_id: string | null
  created_by: string | null
  is_favorite: boolean
  color: string | null
  icon: string | null
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface WorkspaceFile {
  id: string
  user_id: string
  name: string
  description: string | null
  file_url: string
  file_type: string
  file_size: number
  folder_id: string | null
  uploaded_by: string | null
  visibility: FileVisibility
  is_favorite: boolean
  tags: string[]
  version: number
  parent_file_id: string | null
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface FileShare {
  id: string
  file_id: string
  shared_with_user_id: string | null
  shared_with_team_id: string | null
  shared_by: string
  can_edit: boolean
  can_download: boolean
  can_share: boolean
  expires_at: string | null
  created_at: string
}

export interface FolderWithFiles {
  folder: WorkspaceFolder
  files: WorkspaceFile[]
  subfolders: WorkspaceFolder[]
}

export interface WorkspaceStats {
  totalFolders: number
  totalFiles: number
  totalSize: number
  favoriteFiles: number
  byVisibility: {
    private: number
    team: number
    public: number
  }
  byType: Record<string, number>
}

// ============================================================================
// FOLDER OPERATIONS
// ============================================================================

/**
 * Get all folders for a user
 */
export async function getFolders(
  userId: string,
  parentFolderId?: string | null
): Promise<{ data: WorkspaceFolder[] | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    logger.info('Fetching workspace folders', { userId, parentFolderId })

    const supabase = createClient()

    let query = supabase
      .from('collaboration_workspace_folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    // Filter by parent folder
    if (parentFolderId === null) {
      query = query.is('parent_folder_id', null)
    } else if (parentFolderId) {
      query = query.eq('parent_folder_id', parentFolderId)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch folders', { error: error.message, userId })
      return { data: null, error }
    }

    const duration = performance.now() - startTime

    logger.info('Folders fetched successfully', {
      userId,
      count: data?.length || 0,
      duration
    })

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getFolders', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Get folder by ID
 */
export async function getFolderById(
  folderId: string,
  userId: string
): Promise<{ data: WorkspaceFolder | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching folder by ID', { folderId, userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch folder', { error: error.message, folderId })
      return { data: null, error }
    }

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getFolderById', { error: dbError.message, folderId })
    return { data: null, error: dbError }
  }
}

/**
 * Create new folder
 */
export async function createFolder(
  userId: string,
  folder: {
    name: string
    description?: string
    parent_folder_id?: string | null
    color?: string
    icon?: string
  }
): Promise<{ data: WorkspaceFolder | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating folder', { userId, folderName: folder.name })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_folders')
      .insert({
        user_id: userId,
        name: folder.name,
        description: folder.description || null,
        parent_folder_id: folder.parent_folder_id || null,
        created_by: userId,
        color: folder.color || null,
        icon: folder.icon || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create folder', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('Folder created successfully', {
      folderId: data.id,
      name: data.name
    })

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in createFolder', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Update folder
 */
export async function updateFolder(
  folderId: string,
  userId: string,
  updates: {
    name?: string
    description?: string
    parent_folder_id?: string | null
    is_favorite?: boolean
    color?: string
    icon?: string
  }
): Promise<{ data: WorkspaceFolder | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating folder', { folderId, userId, updates })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_folders')
      .update(updates)
      .eq('id', folderId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update folder', { error: error.message, folderId })
      return { data: null, error }
    }

    logger.info('Folder updated successfully', { folderId })
    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in updateFolder', { error: dbError.message, folderId })
    return { data: null, error: dbError }
  }
}

/**
 * Delete folder
 */
export async function deleteFolder(
  folderId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting folder', { folderId, userId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_workspace_folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete folder', { error: error.message, folderId })
      return { success: false, error }
    }

    logger.info('Folder deleted successfully', { folderId })
    return { success: true, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in deleteFolder', { error: dbError.message, folderId })
    return { success: false, error: dbError }
  }
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Get all files for a user
 */
export async function getFiles(
  userId: string,
  filters?: {
    folder_id?: string | null
    visibility?: FileVisibility
    is_favorite?: boolean
    tags?: string[]
    file_type?: string
    search?: string
  }
): Promise<{ data: WorkspaceFile[] | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    logger.info('Fetching workspace files', { userId, filters })

    const supabase = createClient()

    let query = supabase
      .from('collaboration_workspace_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.folder_id === null) {
      query = query.is('folder_id', null)
    } else if (filters?.folder_id) {
      query = query.eq('folder_id', filters.folder_id)
    }

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility)
    }

    if (filters?.is_favorite !== undefined) {
      query = query.eq('is_favorite', filters.is_favorite)
    }

    if (filters?.file_type) {
      query = query.eq('file_type', filters.file_type)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch files', { error: error.message, userId })
      return { data: null, error }
    }

    const duration = performance.now() - startTime

    logger.info('Files fetched successfully', {
      userId,
      count: data?.length || 0,
      duration
    })

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getFiles', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Get file by ID
 */
export async function getFileById(
  fileId: string,
  userId: string
): Promise<{ data: WorkspaceFile | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching file by ID', { fileId, userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch file', { error: error.message, fileId })
      return { data: null, error }
    }

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getFileById', { error: dbError.message, fileId })
    return { data: null, error: dbError }
  }
}

/**
 * Create new file
 */
export async function createFile(
  userId: string,
  file: {
    name: string
    description?: string
    file_url: string
    file_type: string
    file_size: number
    folder_id?: string | null
    visibility?: FileVisibility
    tags?: string[]
  }
): Promise<{ data: WorkspaceFile | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating file', { userId, fileName: file.name, fileSize: file.file_size })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_files')
      .insert({
        user_id: userId,
        name: file.name,
        description: file.description || null,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size,
        folder_id: file.folder_id || null,
        uploaded_by: userId,
        visibility: file.visibility || 'private',
        tags: file.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('File created successfully', {
      fileId: data.id,
      name: data.name,
      size: data.file_size
    })

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in createFile', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Update file
 */
export async function updateFile(
  fileId: string,
  userId: string,
  updates: {
    name?: string
    description?: string
    folder_id?: string | null
    visibility?: FileVisibility
    is_favorite?: boolean
    tags?: string[]
  }
): Promise<{ data: WorkspaceFile | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating file', { fileId, userId, updates })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_files')
      .update(updates)
      .eq('id', fileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update file', { error: error.message, fileId })
      return { data: null, error }
    }

    logger.info('File updated successfully', { fileId })
    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in updateFile', { error: dbError.message, fileId })
    return { data: null, error: dbError }
  }
}

/**
 * Delete file
 */
export async function deleteFile(
  fileId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting file', { fileId, userId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_workspace_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete file', { error: error.message, fileId })
      return { success: false, error }
    }

    logger.info('File deleted successfully', { fileId })
    return { success: true, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in deleteFile', { error: dbError.message, fileId })
    return { success: false, error: dbError }
  }
}

/**
 * Move file to different folder
 */
export async function moveFile(
  fileId: string,
  userId: string,
  newFolderId: string | null
): Promise<{ data: WorkspaceFile | null; error: DatabaseError | null }> {
  try {
    logger.info('Moving file', { fileId, userId, newFolderId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_workspace_files')
      .update({ folder_id: newFolderId })
      .eq('id', fileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to move file', { error: error.message, fileId })
      return { data: null, error }
    }

    logger.info('File moved successfully', { fileId, newFolderId })
    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in moveFile', { error: dbError.message, fileId })
    return { data: null, error: dbError }
  }
}

// ============================================================================
// FILE SHARING OPERATIONS
// ============================================================================

/**
 * Share file with user or team
 */
export async function shareFile(
  fileId: string,
  sharedBy: string,
  share: {
    shared_with_user_id?: string
    shared_with_team_id?: string
    can_edit?: boolean
    can_download?: boolean
    can_share?: boolean
    expires_at?: string
  }
): Promise<{ data: FileShare | null; error: DatabaseError | null }> {
  try {
    logger.info('Sharing file', { fileId, sharedBy, share })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_file_shares')
      .insert({
        file_id: fileId,
        shared_with_user_id: share.shared_with_user_id || null,
        shared_with_team_id: share.shared_with_team_id || null,
        shared_by: sharedBy,
        can_edit: share.can_edit ?? false,
        can_download: share.can_download ?? true,
        can_share: share.can_share ?? false,
        expires_at: share.expires_at || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to share file', { error: error.message, fileId })
      return { data: null, error }
    }

    logger.info('File shared successfully', { shareId: data.id, fileId })
    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in shareFile', { error: dbError.message, fileId })
    return { data: null, error: dbError }
  }
}

/**
 * Get file shares
 */
export async function getFileShares(
  fileId: string
): Promise<{ data: FileShare[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching file shares', { fileId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_file_shares')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch file shares', { error: error.message, fileId })
      return { data: null, error }
    }

    return { data, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getFileShares', { error: dbError.message, fileId })
    return { data: null, error: dbError }
  }
}

/**
 * Remove file share
 */
export async function removeFileShare(
  shareId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Removing file share', { shareId, userId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_file_shares')
      .delete()
      .eq('id', shareId)
      .eq('shared_by', userId)

    if (error) {
      logger.error('Failed to remove share', { error: error.message, shareId })
      return { success: false, error }
    }

    logger.info('File share removed successfully', { shareId })
    return { success: true, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in removeFileShare', { error: dbError.message, shareId })
    return { success: false, error: dbError }
  }
}

// ============================================================================
// STATISTICS & UTILITIES
// ============================================================================

/**
 * Get workspace statistics
 */
export async function getWorkspaceStats(
  userId: string
): Promise<{ data: WorkspaceStats | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching workspace statistics', { userId })

    const supabase = createClient()

    // Get folders count
    const { count: foldersCount } = await supabase
      .from('collaboration_workspace_folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get files count
    const { data: files } = await supabase
      .from('collaboration_workspace_files')
      .select('*')
      .eq('user_id', userId)

    const stats = {
      totalFolders: foldersCount || 0,
      totalFiles: files?.length || 0,
      totalSize: files?.reduce((sum, f) => sum + f.file_size, 0) || 0,
      favoriteFiles: files?.filter(f => f.is_favorite).length || 0,
      byVisibility: {
        private: files?.filter(f => f.visibility === 'private').length || 0,
        team: files?.filter(f => f.visibility === 'team').length || 0,
        public: files?.filter(f => f.visibility === 'public').length || 0
      },
      byType: files?.reduce((acc: Record<string, number>, file) => {
        const ext = file.file_type || 'unknown'
        acc[ext] = (acc[ext] || 0) + 1
        return acc
      }, {}) || {}
    }

    logger.info('Workspace statistics calculated', { userId, stats })
    return { data: stats, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getWorkspaceStats', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Get folder with contents (files and subfolders)
 */
export async function getFolderContents(
  userId: string,
  folderId: string | null
): Promise<{ data: FolderWithFiles | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching folder contents', { userId, folderId })

    const supabase = createClient()

    // Get folder details (if not root)
    let folder: WorkspaceFolder | null = null
    if (folderId) {
      const { data: folderData, error: folderError } = await getFolderById(folderId, userId)
      if (folderError) {
        return { data: null, error: folderError }
      }
      folder = folderData
    }

    // Get subfolders
    const { data: subfolders, error: subfoldersError } = await getFolders(userId, folderId)
    if (subfoldersError) {
      return { data: null, error: subfoldersError }
    }

    // Get files
    const { data: files, error: filesError } = await getFiles(userId, { folder_id: folderId })
    if (filesError) {
      return { data: null, error: filesError }
    }

    const result: FolderWithFiles = {
      folder: folder!,
      files: files || [],
      subfolders: subfolders || []
    }

    logger.info('Folder contents fetched successfully', {
      userId,
      folderId,
      filesCount: files?.length || 0,
      subfoldersCount: subfolders?.length || 0
    })

    return { data: result, error: null }

  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getFolderContents', { error: dbError.message, userId, folderId })
    return { data: null, error: dbError }
  }
}
