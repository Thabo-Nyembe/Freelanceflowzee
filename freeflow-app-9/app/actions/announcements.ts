'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// ===================================
// Announcement Server Actions
// Created: December 14, 2024
// ===================================

export interface CreateAnnouncementData {
  title: string
  content: string
  announcement_type?: string
  status?: string
  priority?: string
  scheduled_for?: string
  expires_at?: string
  target_audience?: string
  target_groups?: any
  is_pinned?: boolean
  is_featured?: boolean
  show_banner?: boolean
  banner_color?: string
  icon?: string
  send_email?: boolean
  send_push?: boolean
  tags?: any
  metadata?: any
}

export async function createAnnouncement(data: CreateAnnouncementData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/announcements-v2')
  return announcement
}

export async function updateAnnouncement(id: string, data: Partial<CreateAnnouncementData>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcement, error } = await supabase
    .from('announcements')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/announcements-v2')
  return announcement
}

export async function deleteAnnouncement(id: string, hardDelete: boolean = false) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (hardDelete) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('announcements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  revalidatePath('/dashboard/announcements-v2')
  return { success: true }
}

export async function publishAnnouncement(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcement, error } = await supabase
    .from('announcements')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/announcements-v2')
  return announcement
}

export async function pinAnnouncement(id: string, isPinned: boolean) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcement, error } = await supabase
    .from('announcements')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/announcements-v2')
  return announcement
}

export async function incrementAnnouncementViews(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.rpc('increment_announcement_views', { announcement_id: id })

  if (error) console.error('Error incrementing views:', error)

  return { success: !error }
}

export async function getAnnouncementStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    total: announcements?.length || 0,
    published: announcements?.filter(a => a.status === 'published').length || 0,
    draft: announcements?.filter(a => a.status === 'draft').length || 0,
    scheduled: announcements?.filter(a => a.status === 'scheduled').length || 0,
    totalViews: announcements?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0,
    totalReactions: announcements?.reduce((sum, a) => sum + (a.reactions_count || 0), 0) || 0
  }

  return stats
}
