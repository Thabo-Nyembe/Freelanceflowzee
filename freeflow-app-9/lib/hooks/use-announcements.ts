// Hook for Announcements management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type AnnouncementType = 'general' | 'urgent' | 'update' | 'policy' | 'event' | 'maintenance' | 'achievement' | 'alert'
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'cancelled'
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'
export type TargetAudience = 'all' | 'employees' | 'customers' | 'partners' | 'admins' | 'specific'

export interface Announcement {
  id: string
  user_id: string
  organization_id: string | null
  title: string
  content: string
  announcement_type: AnnouncementType
  status: AnnouncementStatus
  priority: AnnouncementPriority
  published_at: string | null
  scheduled_for: string | null
  expires_at: string | null
  target_audience: TargetAudience
  target_groups: any
  target_users: any
  views_count: number
  reads_count: number
  reactions_count: number
  comments_count: number
  is_pinned: boolean
  is_featured: boolean
  show_banner: boolean
  banner_color: string | null
  icon: string | null
  attachments: any
  media_urls: any
  send_email: boolean
  send_push: boolean
  email_sent_at: string | null
  push_sent_at: string | null
  tags: any
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseAnnouncementsOptions {
  status?: AnnouncementStatus | 'all'
  announcementType?: AnnouncementType | 'all'
  priority?: AnnouncementPriority | 'all'
  limit?: number
}

export function useAnnouncements(options: UseAnnouncementsOptions = {}) {
  const { status, announcementType, priority, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (announcementType && announcementType !== 'all') filters.announcement_type = announcementType
  if (priority && priority !== 'all') filters.priority = priority

  const queryOptions: any = {
    table: 'announcements',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Announcement>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'announcements',
    onSuccess: refetch
  })

  return {
    announcements: data,
    loading,
    error,
    mutating,
    createAnnouncement: create,
    updateAnnouncement: update,
    deleteAnnouncement: remove,
    refetch
  }
}
