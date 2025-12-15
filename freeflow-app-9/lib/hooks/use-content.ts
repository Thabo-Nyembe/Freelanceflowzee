'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ContentType = 'article' | 'blog' | 'page' | 'post' | 'video' | 'audio' | 'image' | 'document' | 'infographic' | 'ebook' | 'whitepaper' | 'case_study'
export type ContentStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived' | 'deleted'

export interface Content {
  id: string
  user_id: string
  title: string
  slug?: string
  content_type: ContentType
  body?: string
  body_html?: string
  excerpt?: string
  description?: string
  status: ContentStatus
  published_at?: string
  scheduled_for?: string
  expired_at?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_card?: string
  featured_image?: string
  thumbnail_url?: string
  video_url?: string
  audio_url?: string
  gallery_images?: string[]
  media_attachments?: any
  author_id?: string
  author_name?: string
  contributors?: string[]
  category?: string
  subcategory?: string
  tags?: string[]
  topics?: string[]
  view_count: number
  unique_views: number
  like_count: number
  share_count: number
  comment_count: number
  bookmark_count: number
  avg_read_time_seconds?: number
  completion_rate?: number
  bounce_rate?: number
  allow_comments: boolean
  allow_sharing: boolean
  is_featured: boolean
  is_premium: boolean
  is_private: boolean
  version: number
  revision_notes?: string
  parent_content_id?: string
  language: string
  translations?: any
  is_translated: boolean
  text_format: string
  table_of_contents?: any
  word_count?: number
  character_count?: number
  custom_fields?: any
  metadata?: any
  workflow_state?: string
  reviewer_id?: string
  reviewed_at?: string
  approval_status?: string
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseContentOptions {
  contentType?: ContentType | 'all'
  status?: ContentStatus | 'all'
  limit?: number
}

export function useContent(options: UseContentOptions = {}) {
  const { contentType, status, limit } = options

  const filters: Record<string, any> = {}
  if (contentType && contentType !== 'all') filters.content_type = contentType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'content',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Content>(queryOptions)

  const { mutate: createContent } = useSupabaseMutation({
    table: 'content',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateContent } = useSupabaseMutation({
    table: 'content',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteContent } = useSupabaseMutation({
    table: 'content',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    content: data,
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    refetch
  }
}
