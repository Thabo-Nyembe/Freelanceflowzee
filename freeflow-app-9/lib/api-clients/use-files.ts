/**
 * Files/Storage React Hooks
 *
 * TanStack Query hooks for file management and Supabase Storage
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  filesClient,
  FileItem,
  Folder,
  UploadFileData,
  UpdateFileData,
  CreateFolderData,
  FileFilters,
  StorageStats
} from './files-client'
import { isDemoMode } from './base-client'

// Demo files data for showcase
function getDemoFiles() {
  const now = new Date()
  const items: FileItem[] = [
    {
      id: 'demo-file-1',
      user_id: 'demo',
      name: 'project-proposal.pdf',
      original_name: 'Project Proposal Q1 2024.pdf',
      mime_type: 'application/pdf',
      size: 2540000,
      storage_path: '/files/demo/project-proposal.pdf',
      folder_id: null,
      is_public: false,
      is_starred: true,
      is_deleted: false,
      metadata: {},
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-file-2',
      user_id: 'demo',
      name: 'design-mockups.zip',
      original_name: 'Design Mockups v2.zip',
      mime_type: 'application/zip',
      size: 15800000,
      storage_path: '/files/demo/design-mockups.zip',
      folder_id: null,
      is_public: false,
      is_starred: false,
      is_deleted: false,
      metadata: {},
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-file-3',
      user_id: 'demo',
      name: 'brand-guidelines.png',
      original_name: 'Brand Guidelines 2024.png',
      mime_type: 'image/png',
      size: 4200000,
      storage_path: '/files/demo/brand-guidelines.png',
      folder_id: null,
      is_public: true,
      is_starred: true,
      is_deleted: false,
      metadata: {},
      created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-file-4',
      user_id: 'demo',
      name: 'meeting-recording.mp4',
      original_name: 'Client Meeting Recording.mp4',
      mime_type: 'video/mp4',
      size: 85000000,
      storage_path: '/files/demo/meeting-recording.mp4',
      folder_id: null,
      is_public: false,
      is_starred: false,
      is_deleted: false,
      metadata: {},
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  return {
    items,
    pagination: {
      page: 1,
      pageSize: 50,
      total: items.length,
      totalPages: 1
    }
  }
}

/**
 * Get all files with pagination and filters
 */
export function useFiles(
  page: number = 1,
  pageSize: number = 50,
  filters?: FileFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const isDemo = isDemoMode()
  const emptyData = { items: [], pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 } }

  return useQuery({
    queryKey: ['files', page, pageSize, filters],
    queryFn: async () => {
      // Demo mode: return demo files
      if (isDemo) {
        return getDemoFiles()
      }

      // Regular users: fetch from API
      const response = await filesClient.getFiles(page, pageSize, filters)
      if (!response.success || !response.data) {
        // Return empty data for regular users on error (not demo data)
        return emptyData
      }
      return response.data
    },
    // Only use demo placeholder for demo mode
    placeholderData: isDemo ? getDemoFiles() : emptyData,
    ...options
  })
}

/**
 * Get single file by ID
 */
export function useFile(
  id: string,
  options?: Omit<UseQueryOptions<FileItem>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['file', id],
    queryFn: async () => {
      const response = await filesClient.getFile(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch file')
      }
      return response.data
    },
    enabled: !!id,
    ...options
  })
}

/**
 * Upload a file
 */
export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uploadData: UploadFileData) => {
      const response = await filesClient.uploadFile(uploadData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to upload file')
      }
      return response.data
    },
    onSuccess: (file, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] })
      if (variables.folder_id) {
        queryClient.invalidateQueries({ queryKey: ['folders'] })
      }
      toast.success(`${file.original_name} uploaded successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Upload multiple files
 */
export function useUploadFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uploads: UploadFileData[]) => {
      const results = await Promise.allSettled(
        uploads.map(upload => filesClient.uploadFile(upload))
      )

      const successful = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value.data)
        .filter(Boolean)

      const failed = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .length

      return {
        successful,
        failed,
        total: uploads.length
      }
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })

      if (results.failed > 0) {
        toast.warning(
          `Uploaded ${results.successful.length}/${results.total} files. ${results.failed} failed.`
        )
      } else {
        toast.success(`Successfully uploaded ${results.successful.length} files`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update file metadata
 */
export function useUpdateFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateFileData }) => {
      const response = await filesClient.updateFile(id, updates)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update file')
      }
      return response.data
    },
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['file', file.id] })
      if (file.folder_id) {
        queryClient.invalidateQueries({ queryKey: ['folders'] })
      }
      toast.success('File updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete file (soft delete - move to trash)
 */
export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await filesClient.deleteFile(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete file')
      }
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('File moved to trash')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Permanently delete file
 */
export function usePermanentlyDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await filesClient.permanentlyDeleteFile(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to permanently delete file')
      }
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('File permanently deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Star/unstar a file
 */
export function useStarFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      const response = await filesClient.updateFile(id, { is_starred: isStarred })
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update file')
      }
      return response.data
    },
    onMutate: async ({ id, isStarred }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['files'] })
      const previousFiles = queryClient.getQueryData(['files'])

      queryClient.setQueryData(['files'], (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: old.data.map((file: FileItem) =>
            file.id === id ? { ...file, is_starred: isStarred } : file
          )
        }
      })

      return { previousFiles }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousFiles) {
        queryClient.setQueryData(['files'], context.previousFiles)
      }
      toast.error(error.message)
    },
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['file', file.id] })
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] })
    }
  })
}

/**
 * Get all folders
 */
export function useFolders(
  options?: Omit<UseQueryOptions<Folder[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const response = await filesClient.getFolders()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch folders')
      }
      return response.data
    },
    ...options
  })
}

/**
 * Create a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderData: CreateFolderData) => {
      const response = await filesClient.createFolder(folderData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create folder')
      }
      return response.data
    },
    onSuccess: (folder) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success(`Folder "${folder.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get storage statistics
 */
export function useStorageStats(
  options?: Omit<UseQueryOptions<StorageStats>, 'queryKey' | 'queryFn'>
) {
  const isDemo = isDemoMode()
  const demoStats: StorageStats = {
    total_files: 24,
    total_size_bytes: 256000000, // 256 MB
    starred_files: 5,
    shared_files: 8,
    storage_limit_bytes: 5000000000, // 5 GB
    storage_used_percentage: 5.12
  }
  const emptyStats: StorageStats = {
    total_files: 0,
    total_size_bytes: 0,
    starred_files: 0,
    shared_files: 0,
    storage_limit_bytes: 5000000000,
    storage_used_percentage: 0
  }

  return useQuery({
    queryKey: ['storage-stats'],
    queryFn: async () => {
      // Demo mode: return demo stats
      if (isDemo) {
        return demoStats
      }

      // Regular users: fetch from API
      try {
        const response = await filesClient.getStorageStats()
        if (!response.success || !response.data) {
          return emptyStats
        }
        return response.data
      } catch {
        return emptyStats
      }
    },
    // Only use demo placeholder for demo mode
    placeholderData: isDemo ? demoStats : emptyStats,
    ...options
  })
}

/**
 * Download a file
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await filesClient.downloadFile(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to download file')
      }
      return response.data
    },
    onSuccess: (data) => {
      // Create download link
      const url = window.URL.createObjectURL(data.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Downloaded ${data.filename}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Move file to folder
 */
export function useMoveFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fileId, folderId }: { fileId: string; folderId: string | null }) => {
      const response = await filesClient.updateFile(fileId, { folder_id: folderId })
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to move file')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('File moved successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}
