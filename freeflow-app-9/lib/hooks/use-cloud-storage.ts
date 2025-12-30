'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type StorageProvider = 'supabase' | 's3' | 'gcs' | 'azure' | 'cloudinary' | 'local'
export type AccessLevel = 'public' | 'private' | 'shared' | 'restricted'
export type FileStatus = 'active' | 'archived' | 'deleted' | 'quarantined'

export interface CloudStorage {
  id: string
  user_id: string
  file_name: string
  original_name?: string
  file_path: string
  full_path?: string
  file_size: number
  file_type?: string
  mime_type?: string
  extension?: string
  storage_provider: StorageProvider
  storage_bucket?: string
  storage_region?: string
  storage_class?: string
  access_level: AccessLevel
  public_url?: string
  signed_url?: string
  signed_url_expires_at?: string
  is_shared: boolean
  shared_with?: string[]
  share_token?: string
  share_expires_at?: string
  share_link?: string
  permissions?: any
  can_view: boolean
  can_download: boolean
  can_edit: boolean
  can_delete: boolean
  version: number
  version_history?: any[]
  is_latest_version: boolean
  parent_version_id?: string
  checksum?: string
  etag?: string
  content_hash?: string
  is_image: boolean
  is_video: boolean
  is_audio: boolean
  is_document: boolean
  width?: number
  height?: number
  duration_seconds?: number
  thumbnail_url?: string
  preview_url?: string
  processing_status: string
  processed_at?: string
  processing_error?: string
  is_optimized: boolean
  optimized_url?: string
  optimized_size?: number
  compression_ratio?: number
  transcoding_status?: string
  transcoded_formats?: string[]
  transcoded_urls?: any
  folder?: string
  category?: string
  tags?: string[]
  labels?: any[]
  download_count: number
  view_count: number
  last_accessed_at?: string
  last_downloaded_at?: string
  is_backed_up: boolean
  backup_location?: string
  last_backup_at?: string
  is_encrypted: boolean
  encryption_algorithm?: string
  encryption_key_id?: string
  metadata?: any
  exif_data?: any
  custom_metadata?: any
  expires_at?: string
  auto_delete_after_days?: number
  retention_period_days?: number
  uploaded_by?: string
  uploaded_from?: string
  upload_ip?: string
  status: FileStatus
  is_deleted: boolean
  deleted_by?: string
  is_scanned: boolean
  scan_status?: string
  scan_result?: string
  scanned_at?: string
  is_starred?: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCloudStorageOptions {
  fileType?: string | 'all'
  status?: FileStatus | 'all'
  folder?: string
  limit?: number
}

export function useCloudStorage(options: UseCloudStorageOptions = {}) {
  const { fileType, status, folder, limit } = options

  const filters: Record<string, any> = {}
  if (fileType && fileType !== 'all') filters.file_type = fileType
  if (status && status !== 'all') filters.status = status
  if (folder) filters.folder = folder

  const queryOptions: any = {
    table: 'cloud_storage',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, isLoading, error, refetch } = useSupabaseQuery<CloudStorage>(queryOptions)

  const { mutate: createFile, remove: removeFile } = useSupabaseMutation<CloudStorage>({
    table: 'cloud_storage',
    onSuccess: refetch
  })

  // Wrapper functions for CRUD operations
  const addFile = async (fileData: Partial<CloudStorage>) => {
    return createFile(fileData)
  }

  const updateFile = async (id: string, fileData: Partial<CloudStorage>) => {
    return createFile(fileData, id)
  }

  const deleteFile = async (id: string) => {
    return removeFile(id)
  }

  // Toggle starred status
  const toggleStarred = async (id: string, currentStarred: boolean) => {
    return createFile({ is_starred: !currentStarred }, id)
  }

  return {
    files: data,
    loading: isLoading,
    error,
    addFile,
    updateFile,
    deleteFile,
    toggleStarred,
    refetch
  }
}
