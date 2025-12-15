'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ArticleCategory = 'getting-started' | 'tutorials' | 'api' | 'troubleshooting' | 'best-practices' | 'faq' | 'general'
export type ArticleType = 'article' | 'video' | 'guide' | 'faq' | 'tutorial' | 'reference'
export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived' | 'outdated'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ArticleVisibility = 'public' | 'private' | 'internal' | 'authenticated'

export interface KnowledgeBaseArticle {
  id: string
  user_id: string

  // Basic Info
  article_title: string
  article_slug: string | null
  description: string | null
  content: string | null

  // Classification
  category: ArticleCategory
  article_type: ArticleType

  // Status
  status: ArticleStatus
  is_published: boolean
  is_featured: boolean

  // Authoring
  author: string | null
  author_id: string | null
  contributors: string[] | null
  reviewer: string | null
  editor: string | null

  // Content Metadata
  read_time_minutes: number
  difficulty_level: DifficultyLevel
  language: string

  // Engagement Metrics
  view_count: number
  unique_views: number
  total_reads: number
  completion_rate: number

  // Feedback
  rating: number
  rating_count: number
  helpful_count: number
  not_helpful_count: number
  helpful_percentage: number
  comment_count: number

  // SEO
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  canonical_url: string | null

  // Organization
  parent_article_id: string | null
  section: string | null
  subsection: string | null
  order_index: number

  // Related Content
  related_articles: string[] | null
  prerequisites: string[] | null
  next_steps: string[] | null
  tags: string[] | null

  // Media
  featured_image_url: string | null
  video_url: string | null
  video_duration_seconds: number | null
  attachments: string[] | null
  code_snippets: any

  // Versioning
  version: number
  previous_version_id: string | null
  is_latest_version: boolean
  change_log: string | null

  // Access Control
  visibility: ArticleVisibility
  allowed_roles: string[] | null
  restricted_to: string[] | null

  // Maintenance
  last_reviewed_at: string | null
  needs_update: boolean
  is_outdated: boolean
  deprecation_notice: string | null

  // Analytics
  search_appearances: number
  search_clicks: number
  avg_time_on_page_seconds: number
  bounce_rate: number

  // Timestamps
  published_at: string | null
  last_updated_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UseKnowledgeBaseOptions {
  category?: ArticleCategory | 'all'
  type?: ArticleType | 'all'
  status?: ArticleStatus | 'all'
  difficulty?: DifficultyLevel | 'all'
  featured?: boolean
}

export function useKnowledgeBase(options: UseKnowledgeBaseOptions = {}) {
  const { category, type, status, difficulty, featured } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('knowledge_base')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (type && type !== 'all') {
      query = query.eq('article_type', type)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty_level', difficulty)
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured)
    }

    return query
  }

  return useSupabaseQuery<KnowledgeBaseArticle>('knowledge_base', buildQuery, [category, type, status, difficulty, featured])
}

export function useCreateArticle() {
  return useSupabaseMutation<KnowledgeBaseArticle>('knowledge_base', 'insert')
}

export function useUpdateArticle() {
  return useSupabaseMutation<KnowledgeBaseArticle>('knowledge_base', 'update')
}

export function useDeleteArticle() {
  return useSupabaseMutation<KnowledgeBaseArticle>('knowledge_base', 'delete')
}
