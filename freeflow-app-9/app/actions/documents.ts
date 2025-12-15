'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createDocument(data: {
  document_title: string
  document_type: string
  access_level?: string
  department?: string
  owner?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: document, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      ...data,
      created_by: user.email || 'Unknown',
      status: 'draft',
      version: '1.0',
      version_number: 1
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}

export async function updateDocumentStatus(id: string, status: string, notes?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
    status,
    last_modified_by: user.email || 'Unknown'
  }

  if (status === 'approved') {
    updateData.approved_by = user.email || 'Unknown'
    updateData.approved_at = new Date().toISOString()
  }

  if (status === 'review') {
    updateData.reviewed_by = user.email || 'Unknown'
    updateData.reviewed_at = new Date().toISOString()
  }

  if (notes) {
    updateData.notes = notes
  }

  const { data: document, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}

export async function recordDocumentView(id: string, isUnique: boolean = false) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('documents')
    .select('view_count, unique_viewers')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const updateData: any = {
    view_count: (current?.view_count || 0) + 1,
    last_accessed_at: new Date().toISOString()
  }

  if (isUnique) {
    updateData.unique_viewers = (current?.unique_viewers || 0) + 1
  }

  const { data: document, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}

export async function recordDocumentDownload(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('documents')
    .select('download_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { data: document, error } = await supabase
    .from('documents')
    .update({
      download_count: (current?.download_count || 0) + 1
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}

export async function shareDocument(id: string, sharedWith: string[]) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('documents')
    .select('share_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { data: document, error } = await supabase
    .from('documents')
    .update({
      shared_with: sharedWith,
      share_count: (current?.share_count || 0) + 1
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}

export async function uploadDocument(id: string, file: { url: string; name: string; size: number; type: string }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2))
  const extension = file.name.split('.').pop() || ''

  const { data: document, error } = await supabase
    .from('documents')
    .update({
      file_url: file.url,
      file_name: file.name,
      file_size_bytes: file.size,
      file_size_mb: fileSizeMB,
      file_extension: extension,
      mime_type: file.type
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}

export async function createNewVersion(id: string, versionNotes: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('documents')
    .select('version_number')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const newVersionNumber = (current?.version_number || 0) + 1
  const newVersion = `${Math.floor(newVersionNumber / 10)}.${newVersionNumber % 10}`

  // Mark current version as not latest
  await supabase
    .from('documents')
    .update({ is_latest_version: false })
    .eq('id', id)
    .eq('user_id', user.id)

  // Create new version (this would typically create a new document record)
  const { data: document, error } = await supabase
    .from('documents')
    .update({
      version_number: newVersionNumber,
      version: newVersion,
      version_notes: versionNotes,
      is_latest_version: true,
      previous_version_id: id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/documents-v2')
  return document
}
