'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('add-ons-actions')

export async function getAddOns(options?: {
  status?: string
  category?: string
  pricingType?: string
  searchQuery?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('add_ons')
      .select('*')
      .is('deleted_at', null)
      .order('rating', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.category) {
      query = query.eq('category', options.category)
    }
    if (options?.pricingType) {
      query = query.eq('pricing_type', options.pricingType)
    }
    if (options?.searchQuery) {
      query = query.or(`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to fetch add-ons', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Add-ons fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data, 'Add-ons fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching add-ons', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createAddOn(addOnData: {
  name: string
  description?: string
  version?: string
  provider?: string
  category?: string
  pricing_type?: string
  price?: number
  currency?: string
  billing_period?: string
  features?: string[]
  requirements?: string[]
  benefits?: string[]
  tags?: string[]
  icon_url?: string
  screenshot_urls?: string[]
  trial_days?: number
  has_trial?: boolean
}): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('add_ons')
      .insert({
        user_id: user.id,
        ...addOnData,
        status: 'available'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create add-on', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on created successfully', { addOnId: data.id })
    return actionSuccess(data, 'Add-on created successfully')
  } catch (error) {
    logger.error('Unexpected error creating add-on', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAddOn(
  addOnId: string,
  updates: {
    name?: string
    description?: string
    version?: string
    provider?: string
    category?: string
    pricing_type?: string
    status?: string
    price?: number
    currency?: string
    billing_period?: string
    features?: string[]
    requirements?: string[]
    benefits?: string[]
    tags?: string[]
    icon_url?: string
    screenshot_urls?: string[]
    trial_days?: number
    has_trial?: boolean
  }
): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('add_ons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update add-on', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on updated successfully', { addOnId })
    return actionSuccess(data, 'Add-on updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating add-on', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function installAddOn(addOnId: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('add_ons')
      .update({
        status: 'installed',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to install add-on', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Increment downloads
    await supabase.rpc('increment_addon_downloads', { addon_id: addOnId })

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on installed successfully', { addOnId })
    return actionSuccess(data, 'Add-on installed successfully')
  } catch (error) {
    logger.error('Unexpected error installing add-on', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function uninstallAddOn(addOnId: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('add_ons')
      .update({
        status: 'available',
        installed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to uninstall add-on', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on uninstalled successfully', { addOnId })
    return actionSuccess(data, 'Add-on uninstalled successfully')
  } catch (error) {
    logger.error('Unexpected error uninstalling add-on', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disableAddOn(addOnId: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('add_ons')
      .update({
        status: 'disabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to disable add-on', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on disabled successfully', { addOnId })
    return actionSuccess(data, 'Add-on disabled successfully')
  } catch (error) {
    logger.error('Unexpected error disabling add-on', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startTrial(addOnId: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get addon to check trial days
    const { data: addon } = await supabase
      .from('add_ons')
      .select('trial_days, has_trial')
      .eq('id', addOnId)
      .single()

    if (!addon?.has_trial) {
      logger.warn('Trial not available for add-on', { addOnId })
      return actionError('This add-on does not have a trial available', 'VALIDATION_ERROR')
    }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + (addon.trial_days || 14))

    const { data, error } = await supabase
      .from('add_ons')
      .update({
        status: 'installed',
        installed_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start trial', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Trial started successfully', { addOnId })
    return actionSuccess(data, 'Trial started successfully')
  } catch (error) {
    logger.error('Unexpected error starting trial', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rateAddOn(addOnId: string, rating: number, review?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    if (rating < 1 || rating > 5) {
      logger.warn('Invalid rating value', { rating, addOnId })
      return actionError('Rating must be between 1 and 5', 'VALIDATION_ERROR')
    }

    // Get current addon stats
    const { data: addon } = await supabase
      .from('add_ons')
      .select('rating, reviews_count')
      .eq('id', addOnId)
      .single()

    if (!addon) {
      logger.error('Add-on not found for rating', { addOnId })
      return actionError('Add-on not found', 'DATABASE_ERROR')
    }

    // Calculate new average rating
    const newReviewsCount = addon.reviews_count + 1
    const newRating = ((addon.rating * addon.reviews_count) + rating) / newReviewsCount

    const { data, error } = await supabase
      .from('add_ons')
      .update({
        rating: Math.round(newRating * 100) / 100,
        reviews_count: newReviewsCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate add-on', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on rated successfully', { addOnId, rating })
    return actionSuccess(data, 'Add-on rated successfully')
  } catch (error) {
    logger.error('Unexpected error rating add-on', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteAddOn(addOnId: string): Promise<ActionResult<void>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('add_ons')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', addOnId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete add-on', { error, addOnId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/add-ons-v2')
    logger.info('Add-on deleted successfully', { addOnId })
    return actionSuccess(undefined, 'Add-on deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting add-on', { error, addOnId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAddOnStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: addOns } = await supabase
      .from('add_ons')
      .select('status, pricing_type, category, rating, downloads')
      .is('deleted_at', null)

    if (!addOns) {
      logger.info('No add-ons found for stats')
      return actionSuccess(null, 'No add-ons found')
    }

    const stats = {
      total: addOns.length,
      installed: addOns.filter(a => a.status === 'installed').length,
      available: addOns.filter(a => a.status === 'available').length,
      disabled: addOns.filter(a => a.status === 'disabled').length,
      free: addOns.filter(a => a.pricing_type === 'free').length,
      paid: addOns.filter(a => a.pricing_type === 'paid' || a.pricing_type === 'subscription').length,
      byCategory: addOns.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      avgRating: addOns.length > 0
        ? addOns.reduce((sum, a) => sum + a.rating, 0) / addOns.length
        : 0,
      totalDownloads: addOns.reduce((sum, a) => sum + a.downloads, 0)
    }

    logger.info('Add-on stats fetched successfully')
    return actionSuccess(stats, 'Add-on stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching add-on stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
