'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('cloud-storage-actions')

interface CloudFile {
  id: string
  file_name: string
  original_name?: string
  file_path: string
  file_size: number
  file_type?: string
  mime_type?: string
  storage_provider?: string
  storage_bucket?: string
  access_level?: string
  folder?: string
  user_id: string
}

export async function createFile(data: {
  file_name: string
  original_name?: string
  file_path: string
  file_size: number
  file_type?: string
  mime_type?: string
  storage_provider?: string
  storage_bucket?: string
  access_level?: string
  folder?: string
}): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file, error } = await supabase
      .from('cloud_storage')
      .insert([{ ...data, user_id: user.id, uploaded_by: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File created successfully', { fileId: file.id, userId: user.id })
    return actionSuccess(file, 'File uploaded successfully')
  } catch (error) {
    logger.error('Unexpected error creating file', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFile(id: string, data: any): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file, error } = await supabase
      .from('cloud_storage')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update file', { error, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File updated successfully', { fileId: id, userId: user.id })
    return actionSuccess(file, 'File updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteFile(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('cloud_storage')
      .update({
        deleted_at: new Date().toISOString(),
        is_deleted: true,
        deleted_by: user.id,
        status: 'deleted'
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete file', { error, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File deleted successfully', { fileId: id, userId: user.id })
    return actionSuccess(undefined, 'File deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function shareFile(id: string, shareConfig: {
  shared_with?: string[]
  share_expires_at?: string
  access_level?: string
}): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Generate share token
    const shareToken = `share_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`

    const { data: file, error } = await supabase
      .from('cloud_storage')
      .update({
        is_shared: true,
        shared_with: shareConfig.shared_with || [],
        share_token: shareToken,
        share_link: shareLink,
        share_expires_at: shareConfig.share_expires_at,
        access_level: shareConfig.access_level || 'shared'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to share file', { error, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File shared successfully', { fileId: id, shareToken, userId: user.id })
    return actionSuccess(file, 'File shared successfully')
  } catch (error) {
    logger.error('Unexpected error sharing file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function unshareFile(id: string): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file, error } = await supabase
      .from('cloud_storage')
      .update({
        is_shared: false,
        shared_with: [],
        share_token: null,
        share_link: null,
        share_expires_at: null
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to unshare file', { error, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File unshared successfully', { fileId: id, userId: user.id })
    return actionSuccess(file, 'File unshared successfully')
  } catch (error) {
    logger.error('Unexpected error unsharing file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createVersion(id: string): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: currentFile, error: fetchError } = await supabase
      .from('cloud_storage')
      .select('version, version_history')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch file for versioning', { error: fetchError, fileId: id, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!currentFile) {
      logger.warn('File not found for versioning', { fileId: id, userId: user.id })
      return actionError('File not found', 'NOT_FOUND')
    }

    const newVersion = (currentFile.version || 1) + 1
    const versionHistory = currentFile.version_history || []

    const { data: file, error } = await supabase
      .from('cloud_storage')
      .update({
        version: newVersion,
        version_history: [...versionHistory, {
          version: currentFile.version,
          created_at: new Date().toISOString(),
          created_by: user.id
        }]
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file version', { error, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File version created', { fileId: id, version: newVersion, userId: user.id })
    return actionSuccess(file, 'New file version created successfully')
  } catch (error) {
    logger.error('Unexpected error creating file version', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementDownloads(id: string): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file, error: fetchError } = await supabase
      .from('cloud_storage')
      .select('download_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch file for download increment', { error: fetchError, fileId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!file) {
      logger.warn('File not found for download increment', { fileId: id })
      return actionError('File not found', 'NOT_FOUND')
    }

    const { data: updated, error: updateError } = await supabase
      .from('cloud_storage')
      .update({
        download_count: (file.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to increment downloads', { error: updateError, fileId: id })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File download incremented', { fileId: id })
    return actionSuccess(updated, 'Download recorded successfully')
  } catch (error) {
    logger.error('Unexpected error incrementing downloads', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementViews(id: string): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file, error: fetchError } = await supabase
      .from('cloud_storage')
      .select('view_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch file for view increment', { error: fetchError, fileId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!file) {
      logger.warn('File not found for view increment', { fileId: id })
      return actionError('File not found', 'NOT_FOUND')
    }

    const { data: updated, error: updateError } = await supabase
      .from('cloud_storage')
      .update({
        view_count: (file.view_count || 0) + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to increment views', { error: updateError, fileId: id })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File view incremented', { fileId: id })
    return actionSuccess(updated, 'View recorded successfully')
  } catch (error) {
    logger.error('Unexpected error incrementing views', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateProcessingStatus(id: string, status: string, error?: string): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const updateData: any = {
      processing_status: status
    }

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString()
    }

    if (error) {
      updateData.processing_error = error
    }

    const { data: file, error: updateError } = await supabase
      .from('cloud_storage')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to update processing status', { error: updateError, fileId: id, userId: user.id })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File processing status updated', { fileId: id, status, userId: user.id })
    return actionSuccess(file, 'Processing status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating processing status', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveFile(id: string): Promise<ActionResult<CloudFile>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: file, error } = await supabase
      .from('cloud_storage')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive file', { error, fileId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/cloud-storage-v2')
    logger.info('File archived successfully', { fileId: id, userId: user.id })
    return actionSuccess(file, 'File archived successfully')
  } catch (error) {
    logger.error('Unexpected error archiving file', { error, fileId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
