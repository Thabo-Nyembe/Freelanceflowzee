'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

// Types
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
export type FileStatus = 'uploading' | 'processing' | 'active' | 'archived' | 'deleted' | 'quarantined'
export type AccessLevel = 'private' | 'team' | 'organization' | 'public' | 'link_only'

export interface MediaFile {
  id: string
  user_id: string
  folder_id: string | null
  file_name: string
  original_name: string | null
  file_type: FileType
  mime_type: string | null
  file_extension: string | null
  storage_path: string | null
  storage_url: string | null
  thumbnail_url: string | null
  preview_url: string | null
  cdn_url: string | null
  file_size: number
  width: number | null
  height: number | null
  duration_seconds: number | null
  page_count: number | null
  status: FileStatus
  is_public: boolean
  is_starred: boolean
  is_featured: boolean
  view_count: number
  download_count: number
  share_count: number
  access_level: AccessLevel
  shared_with: string[] | null
  password_protected: boolean
  expires_at: string | null
  checksum: string | null
  encoding: string | null
  bit_rate: number | null
  sample_rate: number | null
  color_space: string | null
  alt_text: string | null
  description: string | null
  tags: string[] | null
  ai_tags: string[] | null
  transcription: string | null
  extracted_text: string | null
  exif_data: Record<string, unknown>
  metadata: Record<string, unknown>
  uploaded_at: string
  processed_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MediaFolder {
  id: string
  user_id: string
  parent_id: string | null
  folder_name: string
  folder_path: string | null
  description: string | null
  is_root: boolean
  is_system: boolean
  is_starred: boolean
  file_count: number
  folder_count: number
  total_size: number
  access_level: AccessLevel
  shared_with: string[] | null
  color: string | null
  icon: string | null
  sort_order: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Hook Options
interface UseMediaFilesOptions {
  folderId?: string | null
  fileType?: FileType | 'all'
  status?: FileStatus | 'all'
  starred?: boolean
  searchQuery?: string
}

interface UseMediaFoldersOptions {
  parentId?: string | null
  starred?: boolean
}

// Media Files Hook
export function useMediaFiles(options: UseMediaFilesOptions = {}) {
  const { folderId, fileType, status, starred, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('media_files')
      .select('*')
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })

    if (folderId !== undefined) {
      if (folderId === null) {
        query = query.is('folder_id', null)
      } else {
        query = query.eq('folder_id', folderId)
      }
    }

    if (fileType && fileType !== 'all') {
      query = query.eq('file_type', fileType)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (starred !== undefined) {
      query = query.eq('is_starred', starred)
    }

    if (searchQuery) {
      query = query.or(`file_name.ilike.%${searchQuery}%,original_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    return query
  }

  const { data, loading, error, refetch } = useSupabaseQuery<MediaFile>(
    'media_files',
    buildQuery,
    [folderId, fileType, status, starred, searchQuery]
  )

  return {
    files: data,
    loading,
    error,
    refetch
  }
}

// Media Folders Hook
export function useMediaFolders(options: UseMediaFoldersOptions = {}) {
  const { parentId, starred } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('media_folders')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (parentId !== undefined) {
      if (parentId === null) {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', parentId)
      }
    }

    if (starred !== undefined) {
      query = query.eq('is_starred', starred)
    }

    return query
  }

  const { data, loading, error, refetch } = useSupabaseQuery<MediaFolder>(
    'media_folders',
    buildQuery,
    [parentId, starred]
  )

  return {
    folders: data,
    loading,
    error,
    refetch
  }
}

// Images Hook
export function useImages() {
  return useMediaFiles({ fileType: 'image', status: 'active' })
}

// Videos Hook
export function useVideos() {
  return useMediaFiles({ fileType: 'video', status: 'active' })
}

// Audio Files Hook
export function useAudioFiles() {
  return useMediaFiles({ fileType: 'audio', status: 'active' })
}

// Documents Hook
export function useDocuments() {
  return useMediaFiles({ fileType: 'document', status: 'active' })
}

// Starred Files Hook
export function useStarredFiles() {
  return useMediaFiles({ starred: true })
}

// Recent Files Hook
export function useRecentFiles(limit: number = 20) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('media_files')
      .select('*')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(limit)
  }

  const { data, loading, error, refetch } = useSupabaseQuery<MediaFile>(
    'media_files',
    buildQuery,
    ['recent', limit]
  )

  return {
    recentFiles: data,
    loading,
    error,
    refetch
  }
}

// Media Library Mutations
export function useMediaMutations() {
  const createFile = useSupabaseMutation<Partial<MediaFile>>('media_files', 'INSERT')
  const updateFile = useSupabaseMutation<Partial<MediaFile>>('media_files', 'UPDATE')
  const deleteFile = useSupabaseMutation<{ id: string }>('media_files', 'DELETE')

  const createFolder = useSupabaseMutation<Partial<MediaFolder>>('media_folders', 'INSERT')
  const updateFolder = useSupabaseMutation<Partial<MediaFolder>>('media_folders', 'UPDATE')
  const deleteFolder = useSupabaseMutation<{ id: string }>('media_folders', 'DELETE')

  return {
    createFile,
    updateFile,
    deleteFile,
    createFolder,
    updateFolder,
    deleteFolder
  }
}

// Media Stats Hook
export function useMediaStats() {
  const { files } = useMediaFiles()
  const { folders } = useMediaFolders()

  const totalFiles = files.length
  const totalFolders = folders.length
  const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0)
  const totalViews = files.reduce((sum, f) => sum + (f.view_count || 0), 0)
  const totalDownloads = files.reduce((sum, f) => sum + (f.download_count || 0), 0)

  const filesByType = {
    images: files.filter(f => f.file_type === 'image').length,
    videos: files.filter(f => f.file_type === 'video').length,
    audio: files.filter(f => f.file_type === 'audio').length,
    documents: files.filter(f => f.file_type === 'document').length,
    archives: files.filter(f => f.file_type === 'archive').length,
    other: files.filter(f => f.file_type === 'other').length
  }

  const sizeByType = {
    images: files.filter(f => f.file_type === 'image').reduce((sum, f) => sum + (f.file_size || 0), 0),
    videos: files.filter(f => f.file_type === 'video').reduce((sum, f) => sum + (f.file_size || 0), 0),
    audio: files.filter(f => f.file_type === 'audio').reduce((sum, f) => sum + (f.file_size || 0), 0),
    documents: files.filter(f => f.file_type === 'document').reduce((sum, f) => sum + (f.file_size || 0), 0),
    archives: files.filter(f => f.file_type === 'archive').reduce((sum, f) => sum + (f.file_size || 0), 0),
    other: files.filter(f => f.file_type === 'other').reduce((sum, f) => sum + (f.file_size || 0), 0)
  }

  return {
    totalFiles,
    totalFolders,
    totalSize,
    totalViews,
    totalDownloads,
    filesByType,
    sizeByType
  }
}
