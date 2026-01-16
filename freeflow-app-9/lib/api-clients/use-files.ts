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

/**
 * Get all files with pagination and filters
 */
export function useFiles(
  page: number = 1,
  pageSize: number = 50,
  filters?: FileFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['files', page, pageSize, filters],
    queryFn: async () => {
      const response = await filesClient.getFiles(page, pageSize, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch files')
      }
      return response.data
    },
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
  return useQuery({
    queryKey: ['storage-stats'],
    queryFn: async () => {
      const response = await filesClient.getStorageStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch storage stats')
      }
      return response.data
    },
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
