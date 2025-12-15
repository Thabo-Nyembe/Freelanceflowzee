'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Content } from '@/lib/hooks/use-content'

export async function createContent(data: Partial<Content>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: content, error } = await supabase
    .from('content')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}

export async function updateContent(id: string, data: Partial<Content>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: content, error } = await supabase
    .from('content')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}

export async function deleteContent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('content')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
}

export async function publishContent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: content, error } = await supabase
    .from('content')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}

export async function scheduleContent(id: string, scheduledFor: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: content, error } = await supabase
    .from('content')
    .update({
      status: 'scheduled',
      scheduled_for: scheduledFor
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}

export async function incrementViewCount(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: content, error } = await supabase
    .from('content')
    .update({
      view_count: supabase.raw('view_count + 1')
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}

export async function updateContentEngagement(id: string, engagement: { likes?: number, shares?: number, comments?: number }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {}
  if (engagement.likes !== undefined) updateData.like_count = supabase.raw(`like_count + ${engagement.likes}`)
  if (engagement.shares !== undefined) updateData.share_count = supabase.raw(`share_count + ${engagement.shares}`)
  if (engagement.comments !== undefined) updateData.comment_count = supabase.raw(`comment_count + ${engagement.comments}`)

  const { data: content, error } = await supabase
    .from('content')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}

export async function archiveContent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: content, error } = await supabase
    .from('content')
    .update({
      status: 'archived'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-v2')
  return content
}
