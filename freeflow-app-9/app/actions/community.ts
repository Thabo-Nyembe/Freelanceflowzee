'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createCommunity(data: {
  community_name: string
  description?: string
  community_type: string
  is_public?: boolean
  enable_posts?: boolean
  enable_comments?: boolean
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: community, error } = await supabase
    .from('community')
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function updateCommunity(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: community, error } = await supabase
    .from('community')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function deleteCommunity(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('community')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
}

export async function joinCommunity(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('community')
    .select('member_count, active_members')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Community not found')

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

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function leaveCommunity(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('community')
    .select('member_count, active_members')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Community not found')

  const { data: community, error } = await supabase
    .from('community')
    .update({
      member_count: Math.max(0, (current.member_count || 0) - 1),
      active_members: Math.max(0, (current.active_members || 0) - 1)
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function createPost(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('community')
    .select('post_count, total_posts')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Community not found')

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

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function updateEngagement(id: string, engagement: { likes?: number, shares?: number, reactions?: number }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('community')
    .select('like_count, share_count, reaction_count')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Community not found')

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

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function moderateContent(id: string, action: 'flag' | 'remove') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('community')
    .select('flagged_content_count, removed_content_count, moderation_queue_count')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Community not found')

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

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}

export async function verifyCommunity(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/community-v2')
  return community
}
