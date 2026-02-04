'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AppCategory, PricingModel } from '@/lib/hooks/use-marketplace'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('marketplace-actions')

// =============================================
// MARKETPLACE APP ACTIONS
// =============================================

export async function createMarketplaceApp(data: {
  app_name: string
  description?: string
  short_description?: string
  developer_name?: string
  developer_email?: string
  category?: AppCategory
  pricing_model?: PricingModel
  price?: number
  icon_url?: string
  tags?: string[]
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createMarketplaceApp')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating marketplace app', { userId: user.id, appName: data.app_name })

    const { data: app, error } = await supabase
      .from('marketplace_apps')
      .insert({
        user_id: user.id,
        app_name: data.app_name,
        app_slug: data.app_name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        short_description: data.short_description,
        developer_name: data.developer_name,
        developer_email: data.developer_email || user.email,
        category: data.category || 'productivity',
        pricing_model: data.pricing_model || 'free',
        price: data.price || 0,
        icon_url: data.icon_url,
        tags: data.tags,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create marketplace app', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Marketplace app created successfully', { appId: app.id, userId: user.id })
    return actionSuccess(app, 'Marketplace app created successfully')
  } catch (error) {
    logger.error('Unexpected error in createMarketplaceApp', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMarketplaceApp(id: string, updates: {
  app_name?: string
  description?: string
  short_description?: string
  category?: AppCategory
  pricing_model?: PricingModel
  price?: number
  icon_url?: string
  banner_url?: string
  screenshots?: string[]
  tags?: string[]
  version?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateMarketplaceApp')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating marketplace app', { userId: user.id, appId: id })

    const { data: app, error } = await supabase
      .from('marketplace_apps')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update marketplace app', { error: error.message, appId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Marketplace app updated successfully', { appId: app.id, userId: user.id })
    return actionSuccess(app, 'Marketplace app updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateMarketplaceApp', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishApp(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to publishApp')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Publishing app', { userId: user.id, appId: id })

    const { data: app, error } = await supabase
      .from('marketplace_apps')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish app', { error: error.message, appId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('App published successfully', { appId: app.id, userId: user.id })
    return actionSuccess(app, 'App published successfully')
  } catch (error) {
    logger.error('Unexpected error in publishApp', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function featureApp(id: string, featured: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to featureApp')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Featuring/unfeaturing app', { userId: user.id, appId: id, featured })

    const { data: app, error } = await supabase
      .from('marketplace_apps')
      .update({ is_featured: featured })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to feature/unfeature app', { error: error.message, appId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('App featured status updated successfully', { appId: app.id, featured })
    return actionSuccess(app, featured ? 'App featured successfully' : 'App unfeatured successfully')
  } catch (error) {
    logger.error('Unexpected error in featureApp', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function installApp(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to installApp')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Installing app', { userId: user.id, appId: id })

    // Increment install count
    const { data: app, error } = await supabase.rpc('increment_app_installs', { app_id: id })

    if (error) {
      // If RPC doesn't exist, fallback to direct update
      const { data: appData, error: updateError } = await supabase
        .from('marketplace_apps')
        .select('total_installs, total_downloads')
        .eq('id', id)
        .single()

      if (updateError) {
        logger.error('Failed to fetch app data for install', { error: updateError.message, appId: id })
        return actionError(updateError.message, 'DATABASE_ERROR')
      }

      const { error: incrementError } = await supabase
        .from('marketplace_apps')
        .update({
          total_installs: (appData.total_installs || 0) + 1,
          total_downloads: (appData.total_downloads || 0) + 1
        })
        .eq('id', id)

      if (incrementError) {
        logger.error('Failed to increment app installs', { error: incrementError.message, appId: id })
        return actionError(incrementError.message, 'DATABASE_ERROR')
      }
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('App installed successfully', { appId: id, userId: user.id })
    return actionSuccess({ success: true }, 'App installed successfully')
  } catch (error) {
    logger.error('Unexpected error in installApp', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteMarketplaceApp(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteMarketplaceApp')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting marketplace app', { userId: user.id, appId: id })

    const { error } = await supabase
      .from('marketplace_apps')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete marketplace app', { error: error.message, appId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Marketplace app deleted successfully', { appId: id, userId: user.id })
    return actionSuccess({ success: true }, 'Marketplace app deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteMarketplaceApp', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =============================================
// MARKETPLACE REVIEW ACTIONS
// =============================================

export async function createReview(data: {
  app_id: string
  rating: number
  title?: string
  content?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createReview')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating review', { userId: user.id, appId: data.app_id, rating: data.rating })

    const { data: review, error } = await supabase
      .from('marketplace_reviews')
      .insert({
        user_id: user.id,
        app_id: data.app_id,
        rating: data.rating,
        title: data.title,
        content: data.content,
        reviewer_name: user.email?.split('@')[0] || 'Anonymous',
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create review', { error: error.message, appId: data.app_id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update app's average rating
    await updateAppRating(data.app_id)

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Review created successfully', { reviewId: review.id, appId: data.app_id })
    return actionSuccess(review, 'Review created successfully')
  } catch (error) {
    logger.error('Unexpected error in createReview', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateReview(id: string, updates: {
  rating?: number
  title?: string
  content?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateReview')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating review', { userId: user.id, reviewId: id })

    const { data: review, error } = await supabase
      .from('marketplace_reviews')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update review', { error: error.message, reviewId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update app's average rating
    if (review.app_id) {
      await updateAppRating(review.app_id)
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Review updated successfully', { reviewId: review.id, appId: review.app_id })
    return actionSuccess(review, 'Review updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateReview', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markReviewHelpful(id: string, helpful: boolean): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to markReviewHelpful')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Marking review as helpful/not helpful', { userId: user.id, reviewId: id, helpful })

    const column = helpful ? 'helpful_count' : 'not_helpful_count'

    const { data: review, error: fetchError } = await supabase
      .from('marketplace_reviews')
      .select(column)
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch review for helpful marking', { error: fetchError.message, reviewId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const { error } = await supabase
      .from('marketplace_reviews')
      .update({ [column]: (review[column] || 0) + 1 })
      .eq('id', id)

    if (error) {
      logger.error('Failed to mark review as helpful', { error: error.message, reviewId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Review marked successfully', { reviewId: id, helpful })
    return actionSuccess({ success: true }, 'Review marked successfully')
  } catch (error) {
    logger.error('Unexpected error in markReviewHelpful', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function respondToReview(id: string, response: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to respondToReview')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Responding to review', { userId: user.id, reviewId: id })

    const { data: review, error } = await supabase
      .from('marketplace_reviews')
      .update({
        developer_response: response,
        developer_responded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to respond to review', { error: error.message, reviewId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Review response added successfully', { reviewId: review.id })
    return actionSuccess(review, 'Response added successfully')
  } catch (error) {
    logger.error('Unexpected error in respondToReview', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteReview(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteReview')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting review', { userId: user.id, reviewId: id })

    // Get app_id before deleting
    const { data: review } = await supabase
      .from('marketplace_reviews')
      .select('app_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('marketplace_reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete review', { error: error.message, reviewId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update app's average rating
    if (review?.app_id) {
      await updateAppRating(review.app_id)
    }

    revalidatePath('/dashboard/marketplace-v2')
    logger.info('Review deleted successfully', { reviewId: id })
    return actionSuccess({ success: true }, 'Review deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteReview', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

async function updateAppRating(appId: string) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('marketplace_reviews')
    .select('rating')
    .eq('app_id', appId)
    .eq('status', 'approved')
    .is('deleted_at', null)

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await supabase
      .from('marketplace_apps')
      .update({
        average_rating: avgRating,
        rating_count: reviews.length,
        total_reviews: reviews.length
      })
      .eq('id', appId)
  }
}

// =============================================
// STATS & SEARCH
// =============================================

export async function getMarketplaceStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getMarketplaceStats')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Fetching marketplace stats', { userId: user.id })

    const { data: apps } = await supabase
      .from('marketplace_apps')
      .select('total_downloads, total_installs, average_rating, price')
      .eq('status', 'published')
      .is('deleted_at', null)

    const totalApps = apps?.length || 0
    const totalDownloads = apps?.reduce((sum, a) => sum + (a.total_downloads || 0), 0) || 0
    const totalRevenue = apps?.reduce((sum, a) => sum + ((a.price || 0) * (a.total_installs || 0)), 0) || 0
    const avgRating = apps && apps.length > 0
      ? apps.reduce((sum, a) => sum + (a.average_rating || 0), 0) / apps.length
      : 0

    const stats = {
      totalApps,
      totalDownloads,
      totalRevenue,
      avgRating
    }

    logger.info('Marketplace stats fetched successfully', { totalApps })
    return actionSuccess(stats, 'Marketplace stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getMarketplaceStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function searchApps(query: string, options?: {
  category?: AppCategory
  pricingModel?: PricingModel
  minRating?: number
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    logger.info('Searching apps', { query, options })

    let queryBuilder = supabase
      .from('marketplace_apps')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .or(`app_name.ilike.%${query}%,description.ilike.%${query}%,developer_name.ilike.%${query}%`)
      .order('total_downloads', { ascending: false })

    if (options?.category) {
      queryBuilder = queryBuilder.eq('category', options.category)
    }

    if (options?.pricingModel) {
      queryBuilder = queryBuilder.eq('pricing_model', options.pricingModel)
    }

    if (options?.minRating) {
      queryBuilder = queryBuilder.gte('average_rating', options.minRating)
    }

    const { data, error } = await queryBuilder.limit(50)

    if (error) {
      logger.error('Failed to search apps', { error: error.message, query })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Apps search completed', { resultCount: data?.length || 0, query })
    return actionSuccess(data || [], 'Apps search completed successfully')
  } catch (error) {
    logger.error('Unexpected error in searchApps', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
