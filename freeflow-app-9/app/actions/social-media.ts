'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
export interface SocialPostInput {
  content: string
  content_type?: string
  platforms: string[]
  author?: string
  media_urls?: string[]
  thumbnail_url?: string
  link_url?: string
  link_preview?: Record<string, any>
  hashtags?: string[]
  mentions?: string[]
  tags?: string[]
  scheduled_at?: string
  metadata?: Record<string, any>
}

export interface SocialAccountInput {
  platform: string
  account_name: string
  account_id: string
  account_username?: string
  profile_url?: string
  avatar_url?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  permissions?: string[]
  metadata?: Record<string, any>
}

// Post Actions
export async function createSocialPost(input: SocialPostInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('social_posts')
    .insert([{
      ...input,
      user_id: user.id,
      status: input.scheduled_at ? 'scheduled' : 'draft',
      content_type: input.content_type || 'text',
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      saves: 0,
      reach: 0,
      impressions: 0,
      clicks: 0,
      engagement: 0,
      engagement_rate: 0,
      is_trending: false
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function updateSocialPost(id: string, updates: Partial<SocialPostInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('social_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function deleteSocialPost(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('social_posts')
    .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return { success: true }
}

export async function schedulePost(id: string, scheduledAt: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('social_posts')
    .update({
      status: 'scheduled',
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function publishPost(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('social_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function updatePostMetrics(id: string, metrics: {
  likes?: number
  comments?: number
  shares?: number
  views?: number
  reach?: number
  impressions?: number
  clicks?: number
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Calculate engagement and rate
  const totalEngagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
  const engagementRate = metrics.impressions && metrics.impressions > 0
    ? (totalEngagement / metrics.impressions) * 100
    : 0
  const isTrending = engagementRate > 8

  const { data, error } = await supabase
    .from('social_posts')
    .update({
      ...metrics,
      engagement: totalEngagement,
      engagement_rate: engagementRate,
      is_trending: isTrending,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function getSocialPosts() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Account Actions
export async function connectSocialAccount(input: SocialAccountInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('social_accounts')
    .insert([{
      ...input,
      user_id: user.id,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      is_active: true,
      is_verified: false
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function disconnectSocialAccount(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return { success: true }
}

export async function updateAccountMetrics(id: string, metrics: {
  followers_count?: number
  following_count?: number
  posts_count?: number
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('social_accounts')
    .update({
      ...metrics,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/social-media-v2')
  return data
}

export async function getSocialAccounts() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Analytics Actions
export async function getSocialAnalytics(accountId?: string, days: number = 30) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('social_analytics')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(days)

  if (accountId) {
    query = query.eq('account_id', accountId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}
