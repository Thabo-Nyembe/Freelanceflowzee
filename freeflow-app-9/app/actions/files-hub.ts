'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('files-hub-actions')

export interface FileInput {
  name: string
  original_name?: string
  file_path: string
  file_url?: string
  file_type?: string
  mime_type?: string
  size_bytes?: number
  folder_id?: string
  project_id?: string
  client_id?: string
  is_public?: boolean
  tags?: string[]
  description?: string
  thumbnail_url?: string
}

export interface FolderInput {
  name: string
  parent_id?: string
  color?: string
  icon?: string
}

export async function createFile(input: FileInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('files')
      .insert([{ ...input, user_id: user.id, status: 'active' }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('File created successfully', { fileId: data.id })
    return actionSuccess(data, 'File created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating file', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFile(id: string, updates: Partial<FileInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('files')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update file', { error, fileId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('File updated successfully', { fileId: id })
    return actionSuccess(data, 'File updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function toggleFileStar(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file } = await supabase
      .from('files')
      .select('is_starred')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('files')
      .update({ is_starred: !file?.is_starred, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle file star', { error, fileId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('File star toggled successfully', { fileId: id, isStarred: data.is_starred })
    return actionSuccess(data, 'File star toggled successfully')
  } catch (error: any) {
    logger.error('Unexpected error toggling file star', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function moveFile(id: string, folderId: string | null): Promise<ActionResult<any>> {
  return updateFile(id, { folder_id: folderId })
}

export async function deleteFile(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('files')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete file', { error, fileId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('File deleted successfully', { fileId: id })
    return actionSuccess({ success: true }, 'File deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getFiles(folderId?: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })

    if (folderId) {
      query = query.eq('folder_id', folderId)
    } else {
      query = query.is('folder_id', null)
    }

    const { data, error } = await query
    if (error) {
      logger.error('Failed to get files', { error, folderId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Files retrieved successfully', { count: data?.length || 0, folderId })
    return actionSuccess(data || [], 'Files retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting files', { error, folderId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Folder actions
export async function createFolder(input: FolderInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('folders')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create folder', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('Folder created successfully', { folderId: data.id })
    return actionSuccess(data, 'Folder created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating folder', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFolder(id: string, updates: Partial<FolderInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update folder', { error, folderId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('Folder updated successfully', { folderId: id })
    return actionSuccess(data, 'Folder updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating folder', { error, folderId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteFolder(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete folder', { error, folderId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/files-hub-v2')
    logger.info('Folder deleted successfully', { folderId: id })
    return actionSuccess({ success: true }, 'Folder deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting folder', { error, folderId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getFolders(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to get folders', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Folders retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Folders retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting folders', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
