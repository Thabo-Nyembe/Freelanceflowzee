'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('extensions-actions')

export interface ExtensionInput {
  name: string
  description?: string
  version?: string
  developer?: string
  category?: 'browser' | 'desktop' | 'mobile' | 'api' | 'workflow' | 'integration' | 'utility' | 'enhancement'
  extension_type?: 'official' | 'verified' | 'third-party' | 'experimental' | 'legacy'
  status?: 'enabled' | 'disabled' | 'installing' | 'updating' | 'error'
  size?: string
  platform?: string
  permissions?: string[]
  features?: string[]
  compatibility?: string[]
  tags?: string[]
  icon_url?: string
  download_url?: string
  documentation_url?: string
  release_date?: string
  metadata?: Record<string, any>
}

export async function createExtension(input: ExtensionInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('extensions')
      .insert([{
        ...input,
        user_id: user.id
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create extension', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension created successfully', { id: data.id })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension created successfully')
  } catch (error) {
    logger.error('Unexpected error creating extension', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateExtension(id: string, input: Partial<ExtensionInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('extensions')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update extension', { error, id, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension updated successfully', { id })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating extension', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteExtension(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('extensions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete extension', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension deleted successfully', { id })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess({ success: true }, 'Extension deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting extension', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function enableExtension(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('extensions')
      .update({
        status: 'enabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to enable extension', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension enabled successfully', { id })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension enabled successfully')
  } catch (error) {
    logger.error('Unexpected error enabling extension', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disableExtension(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('extensions')
      .update({
        status: 'disabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to disable extension', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension disabled successfully', { id })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension disabled successfully')
  } catch (error) {
    logger.error('Unexpected error disabling extension', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function installExtension(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // First set to installing
    await supabase
      .from('extensions')
      .update({
        status: 'installing',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    // Then complete installation (in real app, this would be async)
    const { data, error } = await supabase
      .from('extensions')
      .update({
        status: 'enabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to install extension', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension installed successfully', { id })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension installed successfully')
  } catch (error) {
    logger.error('Unexpected error installing extension', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateExtensionVersion(id: string, newVersion: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // First set to updating
    await supabase
      .from('extensions')
      .update({
        status: 'updating',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    // Then complete update
    const { data, error } = await supabase
      .from('extensions')
      .update({
        version: newVersion,
        status: 'enabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update extension version', { error, id, newVersion })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension version updated successfully', { id, newVersion })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension version updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating extension version', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementExtensionDownloads(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: extension } = await supabase
      .from('extensions')
      .select('downloads_count')
      .eq('id', id)
      .single()

    if (!extension) {
      return actionError('Extension not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('extensions')
      .update({
        downloads_count: (extension.downloads_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to increment extension downloads', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension downloads incremented successfully', { id })
    return actionSuccess(data, 'Extension downloads incremented successfully')
  } catch (error) {
    logger.error('Unexpected error incrementing extension downloads', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rateExtension(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: extension } = await supabase
      .from('extensions')
      .select('rating, total_reviews')
      .eq('id', id)
      .single()

    if (!extension) {
      return actionError('Extension not found', 'NOT_FOUND')
    }

    const newTotalReviews = (extension.total_reviews || 0) + 1
    const currentTotal = (extension.rating || 0) * (extension.total_reviews || 0)
    const newRating = (currentTotal + rating) / newTotalReviews

    const { data, error } = await supabase
      .from('extensions')
      .update({
        rating: Math.round(newRating * 100) / 100,
        total_reviews: newTotalReviews,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate extension', { error, id, rating })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Extension rated successfully', { id, rating })
    revalidatePath('/dashboard/extensions-v2')
    return actionSuccess(data, 'Extension rated successfully')
  } catch (error) {
    logger.error('Unexpected error rating extension', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getExtensions(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('extensions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get extensions', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Extensions retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting extensions', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
