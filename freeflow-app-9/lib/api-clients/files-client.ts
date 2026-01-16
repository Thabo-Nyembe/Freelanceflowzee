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
   */
  async getFiles(
    page: number = 1,
    pageSize: number = 50,
    filters?: FileFilters
  ) {
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

    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('uploaded_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.folder_id !== undefined) {
        if (filters.folder_id === null) {
          query = query.is('folder_id', null)
        } else {
          query = query.eq('folder_id', filters.folder_id)
        }
      }

      if (filters.mime_types && filters.mime_types.length > 0) {
        query = query.in('mime_type', filters.mime_types)
      }

      if (filters.extensions && filters.extensions.length > 0) {
        query = query.in('extension', filters.extensions)
      }

      if (filters.is_starred !== undefined) {
        query = query.eq('is_starred', filters.is_starred)
      }

      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,original_name.ilike.%${filters.search}%`)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      if (filters.min_size) {
        query = query.gte('size', filters.min_size)
      }

      if (filters.max_size) {
        query = query.lte('size', filters.max_size)
      }

      if (filters.uploaded_after) {
        query = query.gte('uploaded_at', filters.uploaded_after)
      }

      if (filters.uploaded_before) {
        query = query.lte('uploaded_at', filters.uploaded_before)
      }
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

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
        data: data as FileItem[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      },
      error: null
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
    } catch (error: any) {
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
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Folder[],
      error: null
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
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get all user files
    const { data: files } = await supabase
      .from('files')
      .select('size, mime_type, is_starred, is_public, uploaded_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false)

    const { count: folderCount } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (!files) {
      return {
        success: false,
        error: 'Failed to fetch stats',
        data: null
      }
    }

    // Calculate stats
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)
    const storageLimit = 10 * 1024 * 1024 * 1024 // 10GB default

    // Group by MIME type
    const typeMap: Record<string, { count: number; size: number }> = {}
    files.forEach(file => {
      const baseType = file.mime_type?.split('/')[0] || 'other'
      if (!typeMap[baseType]) {
        typeMap[baseType] = { count: 0, size: 0 }
      }
      typeMap[baseType].count++
      typeMap[baseType].size += file.size || 0
    })

    // Recent uploads (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentUploads = files.filter(f =>
      new Date(f.uploaded_at) > sevenDaysAgo
    ).length

    const stats: StorageStats = {
      total_files: files.length,
      total_size: totalSize,
      total_folders: folderCount || 0,
      storage_used: totalSize,
      storage_limit: storageLimit,
      storage_percent: (totalSize / storageLimit) * 100,
      files_by_type: Object.entries(typeMap).map(([type, data]) => ({
        type,
        count: data.count,
        size: data.size
      })),
      recent_uploads: recentUploads,
      starred_files: files.filter(f => f.is_starred).length,
      shared_files: files.filter(f => f.is_public).length
    }

    return {
      success: true,
      data: stats,
      error: null
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
