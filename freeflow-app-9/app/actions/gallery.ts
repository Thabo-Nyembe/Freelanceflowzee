'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface GalleryItemInput {
  title: string
  description?: string
  file_url: string
  thumbnail_url?: string
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other'
  mime_type?: string
  size_bytes?: number
  width?: number
  height?: number
  duration_seconds?: number
  category?: string
  collection_id?: string
  project_id?: string
  client_id?: string
  is_public?: boolean
  is_featured?: boolean
  is_portfolio?: boolean
  tags?: string[]
}

export interface CollectionInput {
  name: string
  description?: string
  cover_image?: string
  is_public?: boolean
  is_featured?: boolean
}

export async function createGalleryItem(input: GalleryItemInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gallery_items')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return data
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItemInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gallery_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return data
}

export async function toggleGalleryItemFeatured(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: item } = await supabase
    .from('gallery_items')
    .select('is_featured')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('gallery_items')
    .update({ is_featured: !item?.is_featured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return data
}

export async function toggleGalleryItemPortfolio(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: item } = await supabase
    .from('gallery_items')
    .select('is_portfolio')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('gallery_items')
    .update({ is_portfolio: !item?.is_portfolio, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return data
}

export async function deleteGalleryItem(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return { success: true }
}

export async function getGalleryItems(collectionId?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('gallery_items')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (collectionId) {
    query = query.eq('collection_id', collectionId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Collection actions
export async function createCollection(input: CollectionInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gallery_collections')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return data
}

export async function updateCollection(id: string, updates: Partial<CollectionInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gallery_collections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return data
}

export async function deleteCollection(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('gallery_collections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/gallery-v2')
  return { success: true }
}

export async function getCollections() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('gallery_collections')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}
