'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('community-actions')

interface Community {
  id: string
  community_name: string
  description?: string
  community_type: string
  is_public?: boolean
  enable_posts?: boolean
  enable_comments?: boolean
  user_id: string
}

export async function createCommunity(data: {
  community_name: string
  description?: string
  community_type: string
  is_public?: boolean
  enable_posts?: boolean
  enable_comments?: boolean
}): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: community, error } = await supabase
      .from('community')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create community', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Community created successfully', { communityId: community.id, userId: user.id })
    return actionSuccess(community, 'Community created successfully')
  } catch (error) {
    logger.error('Unexpected error creating community', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCommunity(id: string, data: any): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: community, error } = await supabase
      .from('community')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update community', { error, communityId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Community updated successfully', { communityId: id, userId: user.id })
    return actionSuccess(community, 'Community updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating community', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteCommunity(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('community')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete community', { error, communityId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Community deleted successfully', { communityId: id, userId: user.id })
    return actionSuccess(undefined, 'Community deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting community', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function joinCommunity(id: string): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('community')
      .select('member_count, active_members')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch community for joining', { error: fetchError, communityId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Community not found for joining', { communityId: id })
      return actionError('Community not found', 'NOT_FOUND')
    }

    const { data: community, error } = await supabase
      .from('community')
      .update({
        member_count: (current.member_count || 0) + 1,
        active_members: (current.active_members || 0) + 1,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to join community', { error, communityId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('User joined community successfully', { communityId: id, userId: user.id })
    return actionSuccess(community, 'Joined community successfully')
  } catch (error) {
    logger.error('Unexpected error joining community', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function leaveCommunity(id: string): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('community')
      .select('member_count, active_members')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch community for leaving', { error: fetchError, communityId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Community not found for leaving', { communityId: id })
      return actionError('Community not found', 'NOT_FOUND')
    }

    const { data: community, error } = await supabase
      .from('community')
      .update({
        member_count: Math.max(0, (current.member_count || 0) - 1),
        active_members: Math.max(0, (current.active_members || 0) - 1)
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to leave community', { error, communityId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('User left community successfully', { communityId: id, userId: user.id })
    return actionSuccess(community, 'Left community successfully')
  } catch (error) {
    logger.error('Unexpected error leaving community', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createPost(id: string): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('community')
      .select('post_count, total_posts')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch community for post creation', { error: fetchError, communityId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Community not found for post creation', { communityId: id })
      return actionError('Community not found', 'NOT_FOUND')
    }

    const { data: community, error } = await supabase
      .from('community')
      .update({
        post_count: (current.post_count || 0) + 1,
        total_posts: (current.total_posts || 0) + 1,
        last_post_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create post in community', { error, communityId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Post created in community successfully', { communityId: id, userId: user.id })
    return actionSuccess(community, 'Post created successfully')
  } catch (error) {
    logger.error('Unexpected error creating post in community', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEngagement(id: string, engagement: { likes?: number, shares?: number, reactions?: number }): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('community')
      .select('like_count, share_count, reaction_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch community for engagement update', { error: fetchError, communityId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Community not found for engagement update', { communityId: id })
      return actionError('Community not found', 'NOT_FOUND')
    }

    const updateData: any = {
      last_activity_at: new Date().toISOString()
    }

    if (engagement.likes !== undefined) {
      updateData.like_count = (current.like_count || 0) + engagement.likes
    }
    if (engagement.shares !== undefined) {
      updateData.share_count = (current.share_count || 0) + engagement.shares
    }
    if (engagement.reactions !== undefined) {
      updateData.reaction_count = (current.reaction_count || 0) + engagement.reactions
    }

    const { data: community, error } = await supabase
      .from('community')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update community engagement', { error, communityId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Community engagement updated', { communityId: id, engagement })
    return actionSuccess(community, 'Engagement updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating community engagement', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function moderateContent(id: string, action: 'flag' | 'remove'): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('community')
      .select('flagged_content_count, removed_content_count, moderation_queue_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch community for moderation', { error: fetchError, communityId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Community not found for moderation', { communityId: id })
      return actionError('Community not found', 'NOT_FOUND')
    }

    const updateData: any = {}

    if (action === 'flag') {
      updateData.flagged_content_count = (current.flagged_content_count || 0) + 1
      updateData.moderation_queue_count = (current.moderation_queue_count || 0) + 1
    } else if (action === 'remove') {
      updateData.removed_content_count = (current.removed_content_count || 0) + 1
      updateData.moderation_queue_count = Math.max(0, (current.moderation_queue_count || 0) - 1)
    }

    const { data: community, error } = await supabase
      .from('community')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to moderate community content', { error, communityId: id, action })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Community content moderated', { communityId: id, action, userId: user.id })
    return actionSuccess(community, `Content ${action === 'flag' ? 'flagged' : 'removed'} successfully`)
  } catch (error) {
    logger.error('Unexpected error moderating community content', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function verifyCommunity(id: string): Promise<ActionResult<Community>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: community, error } = await supabase
      .from('community')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to verify community', { error, communityId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/community-v2')
    logger.info('Community verified successfully', { communityId: id, userId: user.id })
    return actionSuccess(community, 'Community verified successfully')
  } catch (error) {
    logger.error('Unexpected error verifying community', { error, communityId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
