'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('gallery-actions')

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

export async function createGalleryItem(input: GalleryItemInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('gallery_items')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create gallery item', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Gallery item created successfully', { itemId: data.id })
    return actionSuccess(data, 'Gallery item created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating gallery item', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItemInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('gallery_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update gallery item', { error, itemId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Gallery item updated successfully', { itemId: id })
    return actionSuccess(data, 'Gallery item updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating gallery item', { error, itemId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function toggleGalleryItemFeatured(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to toggle gallery item featured status', { error, itemId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Gallery item featured status toggled successfully', { itemId: id, isFeatured: data.is_featured })
    return actionSuccess(data, 'Gallery item featured status toggled successfully')
  } catch (error: any) {
    logger.error('Unexpected error toggling gallery item featured status', { error, itemId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function toggleGalleryItemPortfolio(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to toggle gallery item portfolio status', { error, itemId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Gallery item portfolio status toggled successfully', { itemId: id, isPortfolio: data.is_portfolio })
    return actionSuccess(data, 'Gallery item portfolio status toggled successfully')
  } catch (error: any) {
    logger.error('Unexpected error toggling gallery item portfolio status', { error, itemId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteGalleryItem(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete gallery item', { error, itemId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Gallery item deleted successfully', { itemId: id })
    return actionSuccess({ success: true }, 'Gallery item deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting gallery item', { error, itemId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getGalleryItems(collectionId?: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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
    if (error) {
      logger.error('Failed to get gallery items', { error, collectionId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Gallery items retrieved successfully', { count: data?.length || 0, collectionId })
    return actionSuccess(data || [], 'Gallery items retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting gallery items', { error, collectionId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Collection actions
export async function createCollection(input: CollectionInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('gallery_collections')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create collection', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Collection created successfully', { collectionId: data.id })
    return actionSuccess(data, 'Collection created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating collection', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCollection(id: string, updates: Partial<CollectionInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('gallery_collections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update collection', { error, collectionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Collection updated successfully', { collectionId: id })
    return actionSuccess(data, 'Collection updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating collection', { error, collectionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteCollection(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('gallery_collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete collection', { error, collectionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/gallery-v2')
    logger.info('Collection deleted successfully', { collectionId: id })
    return actionSuccess({ success: true }, 'Collection deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting collection', { error, collectionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getCollections(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('gallery_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      logger.error('Failed to get collections', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Collections retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Collections retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting collections', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
