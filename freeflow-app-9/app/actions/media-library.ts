'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { FileType, FileStatus, AccessLevel } from '@/lib/hooks/use-media-library'

// =============================================
// MEDIA FILE ACTIONS
// =============================================

export async function createMediaFile(data: {
  file_name: string
  original_name?: string
  file_type: FileType
  mime_type?: string
  file_extension?: string
  storage_path?: string
  storage_url?: string
  thumbnail_url?: string
  file_size?: number
  width?: number
  height?: number
  duration_seconds?: number
  folder_id?: string
  tags?: string[]
  description?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('media_files')
    .insert({
      user_id: user.id,
      file_name: data.file_name,
      original_name: data.original_name || data.file_name,
      file_type: data.file_type,
      mime_type: data.mime_type,
      file_extension: data.file_extension,
      storage_path: data.storage_path,
      storage_url: data.storage_url,
      thumbnail_url: data.thumbnail_url,
      file_size: data.file_size || 0,
      width: data.width,
      height: data.height,
      duration_seconds: data.duration_seconds,
      folder_id: data.folder_id,
      tags: data.tags,
      description: data.description,
      status: 'active',
      uploaded_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  // Update folder file count if in a folder
  if (data.folder_id) {
    await updateFolderStats(data.folder_id)
  }

  revalidatePath('/dashboard/media-library-v2')
  return file
}

export async function updateMediaFile(id: string, updates: {
  file_name?: string
  description?: string
  alt_text?: string
  tags?: string[]
  folder_id?: string | null
  is_starred?: boolean
  is_public?: boolean
  access_level?: AccessLevel
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current folder before update
  const { data: currentFile } = await supabase
    .from('media_files')
    .select('folder_id')
    .eq('id', id)
    .single()

  const { data: file, error } = await supabase
    .from('media_files')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // Update folder stats if folder changed
  if (currentFile?.folder_id !== updates.folder_id) {
    if (currentFile?.folder_id) {
      await updateFolderStats(currentFile.folder_id)
    }
    if (updates.folder_id) {
      await updateFolderStats(updates.folder_id)
    }
  }

  revalidatePath('/dashboard/media-library-v2')
  return file
}

export async function moveFile(id: string, folderId: string | null) {
  return updateMediaFile(id, { folder_id: folderId })
}

export async function starFile(id: string, starred: boolean) {
  return updateMediaFile(id, { is_starred: starred })
}

export async function setFilePublic(id: string, isPublic: boolean) {
  return updateMediaFile(id, { is_public: isPublic })
}

export async function incrementFileView(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: file, error: fetchError } = await supabase
    .from('media_files')
    .select('view_count')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('media_files')
    .update({ view_count: (file.view_count || 0) + 1 })
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

export async function incrementFileDownload(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: file, error: fetchError } = await supabase
    .from('media_files')
    .select('download_count')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('media_files')
    .update({ download_count: (file.download_count || 0) + 1 })
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

export async function archiveFile(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('media_files')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/media-library-v2')
  return file
}

export async function deleteMediaFile(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get folder before delete
  const { data: file } = await supabase
    .from('media_files')
    .select('folder_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('media_files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  // Update folder stats
  if (file?.folder_id) {
    await updateFolderStats(file.folder_id)
  }

  revalidatePath('/dashboard/media-library-v2')
  return { success: true }
}

export async function bulkDeleteFiles(ids: string[]) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get folders before delete
  const { data: files } = await supabase
    .from('media_files')
    .select('folder_id')
    .in('id', ids)

  const { error } = await supabase
    .from('media_files')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) throw error

  // Update folder stats
  const folderIds = [...new Set(files?.map(f => f.folder_id).filter(Boolean))]
  for (const folderId of folderIds) {
    if (folderId) await updateFolderStats(folderId)
  }

  revalidatePath('/dashboard/media-library-v2')
  return { success: true, count: ids.length }
}

// =============================================
// MEDIA FOLDER ACTIONS
// =============================================

export async function createMediaFolder(data: {
  folder_name: string
  parent_id?: string
  description?: string
  color?: string
  icon?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Build folder path
  let folderPath = `/${data.folder_name}`
  if (data.parent_id) {
    const { data: parent } = await supabase
      .from('media_folders')
      .select('folder_path')
      .eq('id', data.parent_id)
      .single()

    if (parent?.folder_path) {
      folderPath = `${parent.folder_path}/${data.folder_name}`
    }
  }

  const { data: folder, error } = await supabase
    .from('media_folders')
    .insert({
      user_id: user.id,
      folder_name: data.folder_name,
      folder_path: folderPath,
      parent_id: data.parent_id,
      description: data.description,
      color: data.color,
      icon: data.icon
    })
    .select()
    .single()

  if (error) throw error

  // Update parent folder count
  if (data.parent_id) {
    await updateFolderStats(data.parent_id)
  }

  revalidatePath('/dashboard/media-library-v2')
  return folder
}

export async function updateMediaFolder(id: string, updates: {
  folder_name?: string
  description?: string
  color?: string
  icon?: string
  is_starred?: boolean
  sort_order?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: folder, error } = await supabase
    .from('media_folders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/media-library-v2')
  return folder
}

export async function starFolder(id: string, starred: boolean) {
  return updateMediaFolder(id, { is_starred: starred })
}

export async function moveFolder(id: string, parentId: string | null) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current parent
  const { data: folder } = await supabase
    .from('media_folders')
    .select('parent_id, folder_name')
    .eq('id', id)
    .single()

  // Build new path
  let folderPath = `/${folder?.folder_name}`
  if (parentId) {
    const { data: parent } = await supabase
      .from('media_folders')
      .select('folder_path')
      .eq('id', parentId)
      .single()

    if (parent?.folder_path) {
      folderPath = `${parent.folder_path}/${folder?.folder_name}`
    }
  }

  const { data: updatedFolder, error } = await supabase
    .from('media_folders')
    .update({
      parent_id: parentId,
      folder_path: folderPath
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // Update old and new parent stats
  if (folder?.parent_id) {
    await updateFolderStats(folder.parent_id)
  }
  if (parentId) {
    await updateFolderStats(parentId)
  }

  revalidatePath('/dashboard/media-library-v2')
  return updatedFolder
}

export async function deleteMediaFolder(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get parent before delete
  const { data: folder } = await supabase
    .from('media_folders')
    .select('parent_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('media_folders')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  // Update parent stats
  if (folder?.parent_id) {
    await updateFolderStats(folder.parent_id)
  }

  revalidatePath('/dashboard/media-library-v2')
  return { success: true }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

async function updateFolderStats(folderId: string) {
  const supabase = createServerActionClient({ cookies })

  // Get file count and total size
  const { data: files } = await supabase
    .from('media_files')
    .select('file_size')
    .eq('folder_id', folderId)
    .is('deleted_at', null)

  // Get subfolder count
  const { data: subfolders } = await supabase
    .from('media_folders')
    .select('id')
    .eq('parent_id', folderId)
    .is('deleted_at', null)

  const fileCount = files?.length || 0
  const totalSize = files?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0
  const folderCount = subfolders?.length || 0

  await supabase
    .from('media_folders')
    .update({
      file_count: fileCount,
      folder_count: folderCount,
      total_size: totalSize
    })
    .eq('id', folderId)
}

// =============================================
// STATS & SEARCH
// =============================================

export async function getMediaStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: files } = await supabase
    .from('media_files')
    .select('file_type, file_size, view_count, download_count')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)

  const { data: folders } = await supabase
    .from('media_folders')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const totalFiles = files?.length || 0
  const totalFolders = folders?.length || 0
  const totalSize = files?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0
  const totalViews = files?.reduce((sum, f) => sum + (f.view_count || 0), 0) || 0
  const totalDownloads = files?.reduce((sum, f) => sum + (f.download_count || 0), 0) || 0

  const byType = {
    images: files?.filter(f => f.file_type === 'image').length || 0,
    videos: files?.filter(f => f.file_type === 'video').length || 0,
    audio: files?.filter(f => f.file_type === 'audio').length || 0,
    documents: files?.filter(f => f.file_type === 'document').length || 0
  }

  return {
    totalFiles,
    totalFolders,
    totalSize,
    totalViews,
    totalDownloads,
    byType
  }
}

export async function searchMedia(query: string, options?: {
  fileType?: FileType
  folderId?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let queryBuilder = supabase
    .from('media_files')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .or(`file_name.ilike.%${query}%,original_name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('uploaded_at', { ascending: false })

  if (options?.fileType) {
    queryBuilder = queryBuilder.eq('file_type', options.fileType)
  }

  if (options?.folderId) {
    queryBuilder = queryBuilder.eq('folder_id', options.folderId)
  }

  const { data, error } = await queryBuilder.limit(50)

  if (error) throw error
  return data
}
