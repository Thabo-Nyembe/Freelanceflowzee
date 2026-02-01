/**
 * Files/Storage API Client
 *
 * Provides typed API access to file management and Supabase Storage
 * Supports folders, permissions, sharing, and advanced file operations
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface FileItem {
  id: string
  user_id: string
  name: string
  original_name: string
  path: string
  storage_path: string
  bucket: string
  size: number
  mime_type: string
  extension: string
  folder_id: string | null
  is_public: boolean
  is_starred: boolean
  is_deleted: boolean
  version: number
  thumbnail_url: string | null
  preview_url: string | null
  download_url: string | null
  tags: string[]
  metadata: Record<string, any>
  uploaded_at: string
  updated_at: string
  deleted_at: string | null
  expires_at: string | null
}

export interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  path: string
  color: string | null
  icon: string | null
  is_shared: boolean
  is_public: boolean
  file_count: number
  total_size: number
  created_at: string
  updated_at: string
}

export interface FileShare {
  id: string
  file_id: string
  shared_by: string
  shared_with: string | null // null = public link
  permission: 'view' | 'download' | 'edit'
  expires_at: string | null
  access_count: number
  last_accessed_at: string | null
  share_link: string
  created_at: string
}

export interface FileVersion {
  id: string
  file_id: string
  version: number
  size: number
  storage_path: string
  created_by: string
  created_at: string
  comment: string | null
}

export interface UploadFileData {
  file: File
  folder_id?: string
  is_public?: boolean
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateFileData {
  name?: string
  folder_id?: string
  is_public?: boolean
  is_starred?: boolean
  tags?: string[]
  metadata?: Record<string, any>
}

export interface CreateFolderData {
  name: string
  parent_id?: string
  color?: string
  icon?: string
  is_public?: boolean
}

export interface FileFilters {
  folder_id?: string | null
  mime_types?: string[]
  extensions?: string[]
  is_starred?: boolean
  is_public?: boolean
  search?: string
  tags?: string[]
  min_size?: number
  max_size?: number
  uploaded_after?: string
  uploaded_before?: string
}

export interface StorageStats {
  total_files: number
  total_size: number
  total_folders: number
  storage_used: number
  storage_limit: number
  storage_percent: number
  files_by_type: Array<{
    type: string
    count: number
    size: number
  }>
  recent_uploads: number
  starred_files: number
  shared_files: number
}

class FilesApiClient extends BaseApiClient {
  /**
   * Get all files with filters and pagination
   * Fetches via API to get demo data for demo accounts
   */
  async getFiles(
    page: number = 1,
    pageSize: number = 50,
    filters?: FileFilters
  ) {
    try {
      // Build query params
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pageSize))

      if (filters) {
        if (filters.folder_id) params.set('folder_id', filters.folder_id)
        if (filters.is_starred) params.set('starred', 'true')
        if (filters.search) params.set('search', filters.search)
        if (filters.mime_types?.length) params.set('type', filters.mime_types[0])
      }

      // Fetch via API (uses service role key, supports demo mode)
      const response = await fetch(`/api/files?${params.toString()}`, {
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to fetch files',
          data: null
        }
      }

      // Handle demo mode - pass through demo data
      if (result.demo) {
        const demoFiles = result.files || []
        const demoFolders = result.folders || []
        return {
          success: true,
          data: {
            data: demoFiles as FileItem[],
            folders: demoFolders as Folder[],
            pagination: result.pagination || {
              page,
              pageSize,
              total: demoFiles.length,
              totalPages: 1
            }
          },
          error: null
        }
      }

      const files = result.files || []
      const folders = result.folders || []
      const pagination = result.pagination || { page, limit: pageSize, total: files.length, totalPages: 1 }

      return {
        success: true,
        data: {
          data: files as FileItem[],
          folders: folders as Folder[],
          pagination: {
            page: pagination.page,
            pageSize: pagination.limit || pageSize,
            total: pagination.total || files.length,
            totalPages: pagination.totalPages || Math.ceil((pagination.total || files.length) / pageSize)
          }
        },
        error: null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  }

  /**
   * Get single file by ID
   */
  async getFile(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as FileItem,
      error: null
    }
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(uploadData: UploadFileData) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    try {
      // Generate unique file path
      const timestamp = Date.now()
      const sanitizedName = uploadData.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `${user.id}/${timestamp}-${sanitizedName}`
      const bucket = 'user-files'

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath)

      // Create file record in database
      const fileRecord = {
        user_id: user.id,
        name: uploadData.file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        original_name: uploadData.file.name,
        path: storagePath,
        storage_path: storageData.path,
        bucket,
        size: uploadData.file.size,
        mime_type: uploadData.file.type,
        extension: uploadData.file.name.split('.').pop() || '',
        folder_id: uploadData.folder_id || null,
        is_public: uploadData.is_public || false,
        is_starred: false,
        is_deleted: false,
        version: 1,
        download_url: publicUrl,
        tags: uploadData.tags || [],
        metadata: uploadData.metadata || {},
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert(fileRecord)
        .select()
        .single()

      if (fileError) {
        // Rollback: delete uploaded file
        await supabase.storage.from(bucket).remove([storagePath])
        throw fileError
      }

      return {
        success: true,
        data: fileData as FileItem,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to upload file',
        data: null
      }
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(id: string, updates: UpdateFileData) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('files')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as FileItem,
      error: null
    }
  }

  /**
   * Move file to trash (soft delete)
   */
  async deleteFile(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('files')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as FileItem,
      error: null
    }
  }

  /**
   * Permanently delete file from storage and database
   */
  async permanentlyDeleteFile(id: string) {
    const supabase = createClient()

    // Get file info
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('storage_path, bucket')
      .eq('id', id)
      .single()

    if (fetchError || !file) {
      return {
        success: false,
        error: 'File not found',
        data: null
      }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(file.bucket)
      .remove([file.storage_path])

    if (storageError) {
      return {
        success: false,
        error: storageError.message,
        data: null
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (dbError) {
      return {
        success: false,
        error: dbError.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Get all folders
   */
  async getFolders() {
    try {
      // Fetch via API (uses service role key, supports demo mode)
      const response = await fetch('/api/files?folders_only=true', {
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to fetch folders',
          data: null
        }
      }

      // Handle demo mode - pass through demo folders
      const folders = result.folders || []

      return {
        success: true,
        data: folders as Folder[],
        error: null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(folderData: CreateFolderData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Build folder path
    let path = folderData.name
    if (folderData.parent_id) {
      const { data: parent } = await supabase
        .from('folders')
        .select('path')
        .eq('id', folderData.parent_id)
        .single()

      if (parent) {
        path = `${parent.path}/${folderData.name}`
      }
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: folderData.name,
        parent_id: folderData.parent_id || null,
        path,
        color: folderData.color || null,
        icon: folderData.icon || null,
        is_public: folderData.is_public || false,
        file_count: 0,
        total_size: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Folder,
      error: null
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      // Fetch via API to get demo data for demo accounts
      const response = await fetch('/api/files?stats_only=true', {
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) {
        // Return demo stats as fallback
        const demoStats: StorageStats = {
          total_files: 4,
          total_size: 156 * 1024 * 1024, // 156 MB
          total_folders: 3,
          storage_used: 156 * 1024 * 1024,
          storage_limit: 10 * 1024 * 1024 * 1024, // 10GB
          storage_percent: 1.5,
          files_by_type: [
            { type: 'document', count: 2, size: 25 * 1024 * 1024 },
            { type: 'image', count: 1, size: 31 * 1024 * 1024 },
            { type: 'video', count: 1, size: 100 * 1024 * 1024 }
          ],
          recent_uploads: 2,
          starred_files: 1,
          shared_files: 1
        }
        return {
          success: true,
          data: demoStats,
          error: null
        }
      }

      // Calculate stats from files response
      const files = result.files || []
      const folders = result.folders || []
      const totalSize = files.reduce((sum: number, f: any) => sum + (f.size || 0), 0)
      const storageLimit = 10 * 1024 * 1024 * 1024 // 10GB

      const stats: StorageStats = {
        total_files: files.length,
        total_size: totalSize,
        total_folders: folders.length,
        storage_used: totalSize,
        storage_limit: storageLimit,
        storage_percent: (totalSize / storageLimit) * 100,
        files_by_type: [],
        recent_uploads: files.filter((f: any) => {
          const uploadDate = new Date(f.uploaded_at)
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          return uploadDate > sevenDaysAgo
        }).length,
        starred_files: files.filter((f: any) => f.is_starred).length,
        shared_files: files.filter((f: any) => f.is_public).length
      }

      return {
        success: true,
        data: stats,
        error: null
      }
    } catch (error) {
      // Return demo stats as fallback
      const demoStats: StorageStats = {
        total_files: 4,
        total_size: 156 * 1024 * 1024,
        total_folders: 3,
        storage_used: 156 * 1024 * 1024,
        storage_limit: 10 * 1024 * 1024 * 1024,
        storage_percent: 1.5,
        files_by_type: [
          { type: 'document', count: 2, size: 25 * 1024 * 1024 },
          { type: 'image', count: 1, size: 31 * 1024 * 1024 },
          { type: 'video', count: 1, size: 100 * 1024 * 1024 }
        ],
        recent_uploads: 2,
        starred_files: 1,
        shared_files: 1
      }
      return {
        success: true,
        data: demoStats,
        error: null
      }
    }
  }

  /**
   * Download file
   */
  async downloadFile(id: string) {
    const supabase = createClient()

    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('storage_path, bucket, original_name')
      .eq('id', id)
      .single()

    if (fileError || !file) {
      return {
        success: false,
        error: 'File not found',
        data: null
      }
    }

    const { data, error } = await supabase.storage
      .from(file.bucket)
      .download(file.storage_path)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        blob: data,
        filename: file.original_name
      },
      error: null
    }
  }
}

export const filesClient = new FilesApiClient()
