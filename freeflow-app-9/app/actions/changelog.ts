'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Changelog } from '@/lib/hooks/use-changelog'

export async function createChange(data: Partial<Changelog>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}

export async function updateChange(id: string, data: Partial<Changelog>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}

export async function deleteChange(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('changelog')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
}

export async function publishChange(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .update({
      release_status: 'released',
      published_at: new Date().toISOString(),
      last_published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}

export async function scheduleChange(id: string, scheduledFor: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .update({
      release_status: 'scheduled',
      scheduled_for: scheduledFor
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}

export async function incrementViews(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .update({
      view_count: supabase.raw('view_count + 1')
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}

export async function updateEngagement(id: string, engagement: { likes?: number, comments?: number }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {}
  if (engagement.likes !== undefined) updateData.like_count = supabase.raw(`like_count + ${engagement.likes}`)
  if (engagement.comments !== undefined) updateData.comment_count = supabase.raw(`comment_count + ${engagement.comments}`)

  const { data: changelog, error } = await supabase
    .from('changelog')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}

export async function deprecateChange(id: string, reason: string, alternative?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .update({
      is_deprecated: true,
      deprecated_at: new Date().toISOString(),
      deprecation_reason: reason,
      alternative_solution: alternative
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/changelog-v2')
  return changelog
}
