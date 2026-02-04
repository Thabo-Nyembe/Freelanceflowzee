'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('social-media-actions')

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
export async function createSocialPost(input: SocialPostInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Social post created successfully')
  } catch (error) {
    logger.error('Error creating social post:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSocialPost(id: string, updates: Partial<SocialPostInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('social_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Social post updated successfully')
  } catch (error) {
    logger.error('Error updating social post:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSocialPost(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('social_posts')
      .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(undefined, 'Social post deleted successfully')
  } catch (error) {
    logger.error('Error deleting social post:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function schedulePost(id: string, scheduledAt: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Post scheduled successfully')
  } catch (error) {
    logger.error('Error scheduling post:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishPost(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Post published successfully')
  } catch (error) {
    logger.error('Error publishing post:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePostMetrics(id: string, metrics: {
  likes?: number
  comments?: number
  shares?: number
  views?: number
  reach?: number
  impressions?: number
  clicks?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Post metrics updated successfully')
  } catch (error) {
    logger.error('Error updating post metrics:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSocialPosts(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) return actionError(error.message, 'DATABASE_ERROR')
    return actionSuccess(data || [], 'Social posts fetched successfully')
  } catch (error) {
    logger.error('Error fetching social posts:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Account Actions
export async function connectSocialAccount(input: SocialAccountInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Social account connected successfully')
  } catch (error) {
    logger.error('Error connecting social account:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disconnectSocialAccount(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(undefined, 'Social account disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting social account:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAccountMetrics(id: string, metrics: {
  followers_count?: number
  following_count?: number
  posts_count?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/social-media-v2')
    return actionSuccess(data, 'Account metrics updated successfully')
  } catch (error) {
    logger.error('Error updating account metrics:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSocialAccounts(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return actionError(error.message, 'DATABASE_ERROR')
    return actionSuccess(data || [], 'Social accounts fetched successfully')
  } catch (error) {
    logger.error('Error fetching social accounts:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Analytics Actions
export async function getSocialAnalytics(accountId?: string, days: number = 30): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')
    return actionSuccess(data || [], 'Social analytics fetched successfully')
  } catch (error) {
    logger.error('Error fetching social analytics:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
