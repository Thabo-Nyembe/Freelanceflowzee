/**
 * Storage Management System - Database Queries
 *
 * THE FINAL QUERY LIBRARY - Feature #93 of 93! 🎉
 *
 * Comprehensive query library for multi-cloud storage management
 * with files, folders, versioning, sharing, and analytics.
 *
 * Database Schema: 8 tables
 * - storage_files: File records with multi-cloud support
 * - storage_folders: Folder hierarchy and organization
 * - storage_shares: File and folder sharing
 * - file_versions: Version history tracking
 * - storage_quotas: Storage quota management
 * - storage_providers: Cloud provider configurations
 * - file_activity_log: Activity tracking and audit
 * - file_downloads: Download tracking and analytics
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type StorageProvider = 'aws' | 'google' | 'azure' | 'dropbox' | 'local'
export type FileType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other'
export type FileStatus = 'synced' | 'syncing' | 'error' | 'offline'
export type SharingPermission = 'view' | 'edit' | 'admin'

export interface StorageFile {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  original_name: string
  file_type: FileType
  mime_type: string
  size: number
  storage_provider: StorageProvider
  storage_path: string
  status: FileStatus
  is_public: boolean
  is_encrypted: boolean
  encryption_key: string | null
  thumbnail_url: string | null
  download_count: number
  last_accessed_at: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface StorageFolder {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  description: string | null
  color: string | null
  icon: string | null
  is_shared: boolean
  total_files: number
  total_size: number
  created_at: string
  updated_at: string
}

export interface StorageShare {
  id: string
  user_id: string
  file_id: string | null
  folder_id: string | null
  shared_with_email: string
  permission: SharingPermission
  expires_at: string | null
  password: string | null
  access_count: number
  last_accessed_at: string | null
  created_at: string
  updated_at: string
}

export interface FileVersion {
  id: string
  file_id: string
  version_number: number
  size: number
  storage_path: string
  checksum: string
  created_by: string
  created_at: string
}

export interface StorageQuota {
  id: string
  user_id: string
  total_quota: number
  used_space: number
  file_count: number
  last_calculated_at: string
  created_at: string
  updated_at: string
}

export interface StorageProvider {
  id: string
  user_id: string
  provider: StorageProvider
  provider_name: string
  access_key: string
  secret_key: string
  bucket_name: string
  region: string | null
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface FileActivityLog {
  id: string
  user_id: string
  file_id: string
  action: string
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface FileDownload {
  id: string
  file_id: string
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  download_time: number
  created_at: string
}

// ============================================================================
// FILE QUERIES
// ============================================================================

/**
 * Get files with optional filtering
 */
export async function getFiles(filters?: {
  folder_id?: string | null
  file_type?: FileType
  storage_provider?: StorageProvider
  status?: FileStatus
  search?: string
  tags?: string[]
  is_public?: boolean
  limit?: number
  offset?: number
}): Promise<StorageFile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('storage_files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.folder_id !== undefined) {
    query = query.eq('folder_id', filters.folder_id)
  }

  if (filters?.file_type) {
    query = query.eq('file_type', filters.file_type)
  }

  if (filters?.storage_provider) {
    query = query.eq('storage_provider', filters.storage_provider)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single file by ID
 */
export async function getFile(fileId: string): Promise<StorageFile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Upload a file
 */
export async function uploadFile(file: {
  folder_id?: string
  name: string
  original_name: string
  file_type: FileType
  mime_type: string
  size: number
  storage_provider: StorageProvider
  storage_path: string
  is_public?: boolean
  is_encrypted?: boolean
  tags?: string[]
  metadata?: Record<string, any>
}): Promise<StorageFile> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_files')
    .insert({
      ...file,
      user_id: user.id,
      status: 'syncing'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a file
 */
export async function updateFile(
  fileId: string,
  updates: Partial<Omit<StorageFile, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_files')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Update file status
 */
export async function updateFileStatus(fileId: string, status: FileStatus): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_files')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Move file to folder
 */
export async function moveFile(fileId: string, targetFolderId: string | null): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_files')
    .update({
      folder_id: targetFolderId,
      updated_at: new Date().toISOString()
    })
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Increment file download count
 */
export async function incrementFileDownloadCount(fileId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('storage_files')
    .update({
      download_count: supabase.sql`download_count + 1`,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', fileId)

  if (error) throw error
}

// ============================================================================
// FOLDER QUERIES
// ============================================================================

/**
 * Get folders with optional filtering
 */
export async function getFolders(filters?: {
  parent_id?: string | null
  search?: string
  limit?: number
}): Promise<StorageFolder[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('storage_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (filters?.parent_id !== undefined) {
    query = query.eq('parent_id', filters.parent_id)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single folder by ID
 */
export async function getFolder(folderId: string): Promise<StorageFolder | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_folders')
    .select('*')
    .eq('id', folderId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a folder
 */
export async function createFolder(folder: {
  parent_id?: string
  name: string
  description?: string
  color?: string
  icon?: string
}): Promise<StorageFolder> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_folders')
    .insert({
      ...folder,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a folder
 */
export async function updateFolder(
  folderId: string,
  updates: Partial<Omit<StorageFolder, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_folders')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', folderId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a folder
 */
export async function deleteFolder(folderId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get folder breadcrumb path
 */
export async function getFolderPath(folderId: string): Promise<StorageFolder[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const path: StorageFolder[] = []
  let currentId: string | null = folderId

  while (currentId) {
    const folder = await getFolder(currentId)
    if (!folder) break

    path.unshift(folder)
    currentId = folder.parent_id
  }

  return path
}

// ============================================================================
// SHARING QUERIES
// ============================================================================

/**
 * Get shares for a file or folder
 */
export async function getShares(filters?: {
  file_id?: string
  folder_id?: string
}): Promise<StorageShare[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('storage_shares')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.file_id) {
    query = query.eq('file_id', filters.file_id)
  }

  if (filters?.folder_id) {
    query = query.eq('folder_id', filters.folder_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create a share
 */
export async function createShare(share: {
  file_id?: string
  folder_id?: string
  shared_with_email: string
  permission: SharingPermission
  expires_at?: string
  password?: string
}): Promise<StorageShare> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_shares')
    .insert({
      ...share,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a share
 */
export async function updateShare(
  shareId: string,
  updates: Partial<Omit<StorageShare, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_shares')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', shareId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a share
 */
export async function deleteShare(shareId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_shares')
    .delete()
    .eq('id', shareId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Increment share access count
 */
export async function incrementShareAccessCount(shareId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('storage_shares')
    .update({
      access_count: supabase.sql`access_count + 1`,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', shareId)

  if (error) throw error
}

// ============================================================================
// FILE VERSION QUERIES
// ============================================================================

/**
 * Get file versions
 */
export async function getFileVersions(fileId: string): Promise<FileVersion[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('file_versions')
    .select('*')
    .eq('file_id', fileId)
    .order('version_number', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a file version
 */
export async function createFileVersion(version: {
  file_id: string
  version_number: number
  size: number
  storage_path: string
  checksum: string
}): Promise<FileVersion> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('file_versions')
    .insert({
      ...version,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a file version
 */
export async function deleteFileVersion(versionId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('file_versions')
    .delete()
    .eq('id', versionId)
    .eq('created_by', user.id)

  if (error) throw error
}

// ============================================================================
// QUOTA QUERIES
// ============================================================================

/**
 * Get user quota
 */
export async function getUserQuota(): Promise<StorageQuota | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Update quota usage
 */
export async function updateQuotaUsage(used_space: number, file_count: number): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_quotas')
    .update({
      used_space,
      file_count,
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Calculate quota usage from files
 */
export async function calculateQuotaUsage(): Promise<{ used_space: number; file_count: number }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_files')
    .select('size')
    .eq('user_id', user.id)

  if (error) throw error

  const files = data || []
  const used_space = files.reduce((sum, file) => sum + file.size, 0)
  const file_count = files.length

  return { used_space, file_count }
}

// ============================================================================
// PROVIDER QUERIES
// ============================================================================

/**
 * Get storage providers
 */
export async function getStorageProviders(): Promise<StorageProvider[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_providers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a storage provider
 */
export async function createStorageProvider(provider: {
  provider: StorageProvider
  provider_name: string
  access_key: string
  secret_key: string
  bucket_name: string
  region?: string
  is_default?: boolean
}): Promise<StorageProvider> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('storage_providers')
    .insert({
      ...provider,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a storage provider
 */
export async function updateStorageProvider(
  providerId: string,
  updates: Partial<Omit<StorageProvider, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_providers')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', providerId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a storage provider
 */
export async function deleteStorageProvider(providerId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('storage_providers')
    .delete()
    .eq('id', providerId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// ACTIVITY LOG QUERIES
// ============================================================================

/**
 * Log file activity
 */
export async function logFileActivity(activity: {
  file_id: string
  action: string
  metadata?: Record<string, any>
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('file_activity_log')
    .insert({
      ...activity,
      user_id: user.id
    })

  if (error) throw error
}

/**
 * Get file activity
 */
export async function getFileActivity(fileId: string, limit: number = 50): Promise<FileActivityLog[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('file_activity_log')
    .select('*')
    .eq('file_id', fileId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============================================================================
// DOWNLOAD TRACKING QUERIES
// ============================================================================

/**
 * Log file download
 */
export async function logFileDownload(download: {
  file_id: string
  download_time: number
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('file_downloads')
    .insert({
      ...download,
      user_id: user?.id || null
    })

  if (error) throw error

  await incrementFileDownloadCount(download.file_id)
}

/**
 * Get file download statistics
 */
export async function getFileDownloadStats(fileId: string): Promise<{
  total_downloads: number
  unique_users: number
  average_download_time: number
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('file_downloads')
    .select('user_id, download_time')
    .eq('file_id', fileId)

  if (error) throw error

  const downloads = data || []
  const uniqueUsers = new Set(downloads.map(d => d.user_id).filter(Boolean)).size
  const averageDownloadTime = downloads.length > 0
    ? downloads.reduce((sum, d) => sum + d.download_time, 0) / downloads.length
    : 0

  return {
    total_downloads: downloads.length,
    unique_users: uniqueUsers,
    average_download_time: averageDownloadTime
  }
}

// ============================================================================
// ANALYTICS & DASHBOARD QUERIES
// ============================================================================

/**
 * Get storage statistics
 */
export async function getStorageStatistics(): Promise<{
  totalFiles: number
  totalFolders: number
  totalSize: number
  usedQuota: number
  totalQuota: number
  filesByType: Record<FileType, number>
  filesByProvider: Record<StorageProvider, number>
  recentFiles: StorageFile[]
  largestFiles: StorageFile[]
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [filesData, foldersCount, quota, recentFiles, largestFiles] = await Promise.all([
    supabase
      .from('storage_files')
      .select('file_type, storage_provider, size')
      .eq('user_id', user.id),
    supabase
      .from('storage_folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    getUserQuota(),
    getFiles({ limit: 10 }),
    supabase
      .from('storage_files')
      .select('*')
      .eq('user_id', user.id)
      .order('size', { ascending: false })
      .limit(10)
  ])

  const files = filesData.data || []
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  // Count by type
  const filesByType = files.reduce((acc, file) => {
    acc[file.file_type] = (acc[file.file_type] || 0) + 1
    return acc
  }, {} as Record<FileType, number>)

  // Count by provider
  const filesByProvider = files.reduce((acc, file) => {
    acc[file.storage_provider] = (acc[file.storage_provider] || 0) + 1
    return acc
  }, {} as Record<StorageProvider, number>)

  return {
    totalFiles: files.length,
    totalFolders: foldersCount.count || 0,
    totalSize,
    usedQuota: quota?.used_space || 0,
    totalQuota: quota?.total_quota || 0,
    filesByType,
    filesByProvider,
    recentFiles,
    largestFiles: largestFiles.data || []
  }
}

/**
 * Search files and folders
 */
export async function searchStorage(query: string): Promise<{
  files: StorageFile[]
  folders: StorageFolder[]
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [filesData, foldersData] = await Promise.all([
    supabase
      .from('storage_files')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(20),
    supabase
      .from('storage_folders')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', `%${query}%`)
      .limit(20)
  ])

  return {
    files: filesData.data || [],
    folders: foldersData.data || []
  }
}

/**
 * Get recent activity across all files
 */
export async function getRecentActivity(limit: number = 50): Promise<FileActivityLog[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('file_activity_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
