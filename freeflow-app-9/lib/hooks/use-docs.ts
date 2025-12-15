'use client'

import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

export type DocCategory = 'guides' | 'api' | 'sdk' | 'tutorials' | 'reference' | 'examples'
export type DocType = 'article' | 'guide' | 'reference' | 'tutorial' | 'example' | 'changelog'
export type DocStatus = 'draft' | 'review' | 'published' | 'archived' | 'deprecated'
export type DocVisibility = 'public' | 'private' | 'internal' | 'authenticated'

export interface Doc {
  id: string
  user_id: string
  doc_title: string
  doc_category: DocCategory
  doc_type: DocType
  content: string | null
  summary: string | null
  slug: string | null
  section: string | null
  subsection: string | null
  parent_doc_id: string | null
  order_index: number
  status: DocStatus
  visibility: DocVisibility
  is_featured: boolean
  total_views: number
  unique_views: number
  monthly_views: number
  weekly_views: number
  daily_views: number
  helpful_count: number
  not_helpful_count: number
  helpful_rating_percent: number
  average_rating: number
  review_count: number
  has_code_examples: boolean
  code_language: string | null
  code_copy_count: number
  code_run_count: number
  api_endpoint: string | null
  http_method: string | null
  api_version: string | null
  request_count: number
  avg_response_time_ms: number
  success_rate: number
  sdk_version: string | null
  sdk_language: string | null
  download_count: number
  installation_count: number
  search_keywords: string[] | null
  tags: string[] | null
  search_rank: number
  search_appearances: number
  search_clicks: number
  author: string | null
  contributors: string[] | null
  technical_reviewer: string | null
  editor: string | null
  version: string | null
  previous_version_id: string | null
  is_latest_version: boolean
  version_notes: string | null
  avg_read_time_seconds: number
  completion_rate: number
  bounce_rate: number
  scroll_depth_percent: number
  related_docs: string[] | null
  prerequisites: string[] | null
  next_steps: string[] | null
  last_reviewed_at: string | null
  last_updated_by: string | null
  needs_review: boolean
  is_outdated: boolean
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  external_references: string[] | null
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseDocsOptions {
  category?: DocCategory | 'all'
  status?: DocStatus | 'all'
  type?: DocType | 'all'
}

export function useDocs(options: UseDocsOptions = {}) {
  const { category, status, type } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('docs')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('doc_category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (type && type !== 'all') {
      query = query.eq('doc_type', type)
    }

    return query
  }

  return useSupabaseQuery<Doc>('docs', buildQuery, [category, status, type])
}

export function useCreateDoc() {
  return useSupabaseMutation<Doc>('docs', 'insert')
}

export function useUpdateDoc() {
  return useSupabaseMutation<Doc>('docs', 'update')
}

export function useDeleteDoc() {
  return useSupabaseMutation<Doc>('docs', 'delete')
}
