'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getAddOns(options?: {
  status?: string
  category?: string
  pricingType?: string
  searchQuery?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  return { data }
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
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
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
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
}

export async function installAddOn(addOnId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  // Increment downloads
  await supabase.rpc('increment_addon_downloads', { addon_id: addOnId })

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
}

export async function uninstallAddOn(addOnId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
}

export async function disableAddOn(addOnId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
}

export async function startTrial(addOnId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get addon to check trial days
  const { data: addon } = await supabase
    .from('add_ons')
    .select('trial_days, has_trial')
    .eq('id', addOnId)
    .single()

  if (!addon?.has_trial) {
    return { error: 'This add-on does not have a trial available' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
}

export async function rateAddOn(addOnId: string, rating: number, review?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5' }
  }

  // Get current addon stats
  const { data: addon } = await supabase
    .from('add_ons')
    .select('rating, reviews_count')
    .eq('id', addOnId)
    .single()

  if (!addon) {
    return { error: 'Add-on not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { data }
}

export async function deleteAddOn(addOnId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('add_ons')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', addOnId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/add-ons-v2')
  return { success: true }
}

export async function getAddOnStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: addOns } = await supabase
    .from('add_ons')
    .select('status, pricing_type, category, rating, downloads')
    .is('deleted_at', null)

  if (!addOns) {
    return { data: null }
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

  return { data: stats }
}
