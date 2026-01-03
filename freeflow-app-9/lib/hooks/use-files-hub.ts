'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FileItem {
  id: string
  user_id: string
  name: string
  original_name: string | null
  file_path: string
  file_url: string | null
  file_type: string | null
  mime_type: string | null
  size_bytes: number | null
  folder_id: string | null
  project_id: string | null
  client_id: string | null
  status: 'active' | 'archived' | 'deleted'
  is_public: boolean
  is_starred: boolean
  tags: string[]
  description: string | null
  thumbnail_url: string | null
  metadata: Record<string, any>
  download_count: number
  last_accessed_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  color: string
  icon: string | null
  is_starred: boolean
  path: string | null
  created_at: string
  updated_at: string
}

export function useFiles(folderId?: string | null, initialFiles: FileItem[] = []) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('files')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

      if (folderId) {
        query = query.eq('folder_id', folderId)
      } else {
        query = query.is('folder_id', null)
      }

      const { data, error } = await query

      if (error) throw error
      setFiles(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, folderId])

  const uploadFile = async (file: Partial<FileItem>) => {
    const { data, error } = await supabase
      .from('files')
      .insert([file])
      .select()
      .single()

    if (error) throw error
    setFiles(prev => [data, ...prev])
    return data
  }

  const updateFile = async (id: string, updates: Partial<FileItem>) => {
    const { data, error } = await supabase
      .from('files')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setFiles(prev => prev.map(f => f.id === id ? data : f))
    return data
  }

  const toggleStar = async (id: string) => {
    const file = files.find(f => f.id === id)
    if (file) {
      return updateFile(id, { is_starred: !file.is_starred })
    }
  }

  const moveFile = async (id: string, folderId: string | null) => {
    return updateFile(id, { folder_id: folderId })
  }

  const deleteFile = async (id: string) => {
    const { error } = await supabase
      .from('files')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  useEffect(() => {
    const channel = supabase
      .channel('files_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' },
        () => fetchFiles()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchFiles])

  const stats = {
    total: files.length,
    starred: files.filter(f => f.is_starred).length,
    totalSize: files.reduce((sum, f) => sum + (f.size_bytes || 0), 0),
    images: files.filter(f => f.file_type?.startsWith('image')).length,
    documents: files.filter(f => f.file_type?.includes('document') || f.file_type?.includes('pdf')).length
  }

  return {
    files,
    stats,
    isLoading,
    error,
    fetchFiles,
    uploadFile,
    updateFile,
    toggleStar,
    moveFile,
    deleteFile
  }
}

export function useFolders(initialFolders: Folder[] = []) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchFolders = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true })

    if (!error) setFolders(data || [])
    setIsLoading(false)
  }, [supabase])

  const createFolder = async (folder: Partial<Folder>) => {
    const { data, error } = await supabase
      .from('folders')
      .insert([folder])
      .select()
      .single()

    if (error) throw error
    setFolders(prev => [...prev, data])
    return data
  }

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    const { data, error } = await supabase
      .from('folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setFolders(prev => prev.map(f => f.id === id ? data : f))
    return data
  }

  const deleteFolder = async (id: string) => {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) throw error
    setFolders(prev => prev.filter(f => f.id !== id))
  }

  return {
    folders,
    isLoading,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
}

// Combined hook for Files Hub that provides both files and folders
export function useFilesHub(initialFiles: FileItem[] = [], initialFolders: Folder[] = []) {
  const filesHook = useFiles(null, initialFiles)
  const foldersHook = useFolders(initialFolders)

  const stats = {
    totalFiles: filesHook.files.length,
    totalFolders: foldersHook.folders.length,
    totalSize: filesHook.files.reduce((acc, f) => acc + (f.size_bytes || 0), 0),
    starredFiles: filesHook.files.filter(f => f.is_starred).length
  }

  return {
    files: filesHook.files,
    folders: foldersHook.folders,
    stats,
    isLoading: filesHook.isLoading || foldersHook.isLoading,
    error: filesHook.error,
    fetchFiles: filesHook.fetchFiles,
    fetchFolders: foldersHook.fetchFolders,
    uploadFile: filesHook.uploadFile,
    updateFile: filesHook.updateFile,
    toggleStar: filesHook.toggleStar,
    moveFile: filesHook.moveFile,
    deleteFile: filesHook.deleteFile,
    createFolder: foldersHook.createFolder,
    updateFolder: foldersHook.updateFolder,
    deleteFolder: foldersHook.deleteFolder
  }
}
