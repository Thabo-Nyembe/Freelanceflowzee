'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createFile(input: FileInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('files')
    .insert([{ ...input, user_id: user.id, status: 'active' }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return data
}

export async function updateFile(id: string, updates: Partial<FileInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('files')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return data
}

export async function toggleFileStar(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return data
}

export async function moveFile(id: string, folderId: string | null) {
  return updateFile(id, { folder_id: folderId })
}

export async function deleteFile(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('files')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return { success: true }
}

export async function getFiles(folderId?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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
  if (error) throw error
  return data || []
}

// Folder actions
export async function createFolder(input: FolderInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('folders')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return data
}

export async function updateFolder(id: string, updates: Partial<FolderInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('folders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return data
}

export async function deleteFolder(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/files-hub-v2')
  return { success: true }
}

export async function getFolders() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}
