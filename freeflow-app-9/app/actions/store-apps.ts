'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface StoreAppInput {
  name: string
  tagline?: string
  description?: string
  developer?: string
  icon_url?: string
  banner_url?: string
  screenshots?: string[]
  category?: 'business' | 'productivity' | 'creative' | 'finance' | 'education' | 'utilities' | 'developer' | 'social'
  subcategory?: string
  pricing_type?: 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise'
  price?: number
  price_currency?: string
  trial_days?: number
  version?: string
  size_bytes?: number
  features?: string[]
  permissions?: string[]
  compatibility?: string[]
  tags?: string[]
}

export async function getStoreApps(options?: {
  category?: string
  status?: string
  pricing?: string
  search?: string
  limit?: number
}) {
  const supabase = createServerActionClient({ cookies })

  let query = supabase
    .from('store_apps')
    .select('*')
    .is('deleted_at', null)
    .order('downloads', { ascending: false })

  if (options?.category) {
    query = query.eq('category', options.category)
  }
  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.pricing) {
    query = query.eq('pricing_type', options.pricing)
  }
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  const { data, error } = await query.limit(options?.limit || 100)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getInstalledApps() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('store_apps')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['installed', 'trial', 'updating'])
    .is('deleted_at', null)
    .order('installed_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getStoreApp(appId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('store_apps')
    .select('*')
    .eq('id', appId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function installApp(appId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get app to increment downloads
  const { data: app } = await supabase
    .from('store_apps')
    .select('downloads')
    .eq('id', appId)
    .single()

  const { data, error } = await supabase
    .from('store_apps')
    .update({
      user_id: user.id,
      status: 'installed',
      installed_at: new Date().toISOString(),
      downloads: (app?.downloads || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/app-store-v2')
  return { error: null, data }
}

export async function uninstallApp(appId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('store_apps')
    .update({
      status: 'available',
      installed_at: null,
      trial_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/app-store-v2')
  return { error: null, data }
}

export async function startTrial(appId: string, trialDays: number = 14) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const trialExpires = new Date()
  trialExpires.setDate(trialExpires.getDate() + trialDays)

  const { data, error } = await supabase
    .from('store_apps')
    .update({
      user_id: user.id,
      status: 'trial',
      installed_at: new Date().toISOString(),
      trial_expires_at: trialExpires.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/app-store-v2')
  return { error: null, data }
}

export async function updateApp(appId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Set to updating status
  await supabase
    .from('store_apps')
    .update({
      status: 'updating',
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
    .eq('user_id', user.id)

  // Simulate update completion (in real app, this would be async)
  const { data, error } = await supabase
    .from('store_apps')
    .update({
      status: 'installed',
      last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/app-store-v2')
  return { error: null, data }
}

export async function createAppReview(
  appId: string,
  rating: number,
  title?: string,
  content?: string
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('app_reviews')
    .upsert({
      user_id: user.id,
      app_id: appId,
      rating,
      title,
      content
    }, {
      onConflict: 'user_id,app_id'
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/app-store-v2')
  return { error: null, data }
}

export async function getAppReviews(appId: string, limit: number = 50) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('app_reviews')
    .select('*')
    .eq('app_id', appId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function markReviewHelpful(reviewId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: review } = await supabase
    .from('app_reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .single()

  const { data, error } = await supabase
    .from('app_reviews')
    .update({
      helpful_count: (review?.helpful_count || 0) + 1
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getStoreStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: apps } = await supabase
    .from('store_apps')
    .select('*')
    .is('deleted_at', null)

  if (!apps) {
    return { error: null, data: { total: 0, installed: 0, available: 0, trial: 0, totalDownloads: 0, avgRating: 0 } }
  }

  const userApps = apps.filter(a => a.user_id === user.id)

  const stats = {
    total: apps.length,
    installed: userApps.filter(a => a.status === 'installed').length,
    available: apps.filter(a => a.status === 'available').length,
    trial: userApps.filter(a => a.status === 'trial').length,
    totalDownloads: apps.reduce((sum, a) => sum + (a.downloads || 0), 0),
    avgRating: apps.length > 0
      ? apps.reduce((sum, a) => sum + (a.rating || 0), 0) / apps.length
      : 0,
    categories: {
      business: apps.filter(a => a.category === 'business').length,
      productivity: apps.filter(a => a.category === 'productivity').length,
      creative: apps.filter(a => a.category === 'creative').length,
      finance: apps.filter(a => a.category === 'finance').length,
      education: apps.filter(a => a.category === 'education').length,
      utilities: apps.filter(a => a.category === 'utilities').length,
      developer: apps.filter(a => a.category === 'developer').length,
      social: apps.filter(a => a.category === 'social').length
    }
  }

  return { error: null, data: stats }
}
