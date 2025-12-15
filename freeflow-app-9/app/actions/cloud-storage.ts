'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('cloud_storage')
    .insert([{ ...data, user_id: user.id, uploaded_by: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}

export async function updateFile(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('cloud_storage')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}

export async function deleteFile(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
}

export async function shareFile(id: string, shareConfig: {
  shared_with?: string[]
  share_expires_at?: string
  access_level?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}

export async function unshareFile(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}

export async function createVersion(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: currentFile } = await supabase
    .from('cloud_storage')
    .select('version, version_history')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentFile) throw new Error('File not found')

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

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}

export async function incrementDownloads(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('cloud_storage')
    .select('download_count')
    .eq('id', id)
    .single()

  if (error) throw error
  if (!file) throw new Error('File not found')

  const { data: updated, error: updateError } = await supabase
    .from('cloud_storage')
    .update({
      download_count: (file.download_count || 0) + 1,
      last_downloaded_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw updateError

  revalidatePath('/dashboard/cloud-storage-v2')
  return updated
}

export async function incrementViews(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('cloud_storage')
    .select('view_count')
    .eq('id', id)
    .single()

  if (error) throw error
  if (!file) throw new Error('File not found')

  const { data: updated, error: updateError } = await supabase
    .from('cloud_storage')
    .update({
      view_count: (file.view_count || 0) + 1,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw updateError

  revalidatePath('/dashboard/cloud-storage-v2')
  return updated
}

export async function updateProcessingStatus(id: string, status: string, error?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (updateError) throw updateError

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}

export async function archiveFile(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: file, error } = await supabase
    .from('cloud_storage')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/cloud-storage-v2')
  return file
}
