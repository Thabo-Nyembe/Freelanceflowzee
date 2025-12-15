'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { AppCategory, PricingModel, AppStatus } from '@/lib/hooks/use-marketplace'

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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return app
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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app, error } = await supabase
    .from('marketplace_apps')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return app
}

export async function publishApp(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return app
}

export async function featureApp(id: string, featured: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app, error } = await supabase
    .from('marketplace_apps')
    .update({ is_featured: featured })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return app
}

export async function installApp(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Increment install count
  const { data: app, error } = await supabase.rpc('increment_app_installs', { app_id: id })

  if (error) {
    // If RPC doesn't exist, fallback to direct update
    const { data: appData, error: updateError } = await supabase
      .from('marketplace_apps')
      .select('total_installs, total_downloads')
      .eq('id', id)
      .single()

    if (updateError) throw updateError

    await supabase
      .from('marketplace_apps')
      .update({
        total_installs: (appData.total_installs || 0) + 1,
        total_downloads: (appData.total_downloads || 0) + 1
      })
      .eq('id', id)
  }

  revalidatePath('/dashboard/marketplace-v2')
  return { success: true }
}

export async function deleteMarketplaceApp(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('marketplace_apps')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return { success: true }
}

// =============================================
// MARKETPLACE REVIEW ACTIONS
// =============================================

export async function createReview(data: {
  app_id: string
  rating: number
  title?: string
  content?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  // Update app's average rating
  await updateAppRating(data.app_id)

  revalidatePath('/dashboard/marketplace-v2')
  return review
}

export async function updateReview(id: string, updates: {
  rating?: number
  title?: string
  content?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: review, error } = await supabase
    .from('marketplace_reviews')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // Update app's average rating
  if (review.app_id) {
    await updateAppRating(review.app_id)
  }

  revalidatePath('/dashboard/marketplace-v2')
  return review
}

export async function markReviewHelpful(id: string, helpful: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const column = helpful ? 'helpful_count' : 'not_helpful_count'

  const { data: review, error: fetchError } = await supabase
    .from('marketplace_reviews')
    .select(column)
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('marketplace_reviews')
    .update({ [column]: (review[column] || 0) + 1 })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return { success: true }
}

export async function respondToReview(id: string, response: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: review, error } = await supabase
    .from('marketplace_reviews')
    .update({
      developer_response: response,
      developer_responded_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/marketplace-v2')
  return review
}

export async function deleteReview(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  // Update app's average rating
  if (review?.app_id) {
    await updateAppRating(review.app_id)
  }

  revalidatePath('/dashboard/marketplace-v2')
  return { success: true }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

async function updateAppRating(appId: string) {
  const supabase = createServerActionClient({ cookies })

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

export async function getMarketplaceStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  return {
    totalApps,
    totalDownloads,
    totalRevenue,
    avgRating
  }
}

export async function searchApps(query: string, options?: {
  category?: AppCategory
  pricingModel?: PricingModel
  minRating?: number
}) {
  const supabase = createServerActionClient({ cookies })

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

  if (error) throw error
  return data
}
