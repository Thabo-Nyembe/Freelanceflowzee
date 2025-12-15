'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
export interface SEOKeywordInput {
  keyword: string
  current_position?: number
  search_volume?: number
  keyword_difficulty?: number
  cpc?: number
  competition?: number
  estimated_traffic?: number
  target_url?: string
  target_page_title?: string
  is_tracking?: boolean
  is_primary?: boolean
  tags?: string[]
  metadata?: Record<string, any>
}

export interface SEOBacklinkInput {
  source_url: string
  source_domain: string
  target_url: string
  domain_authority?: number
  page_authority?: number
  spam_score?: number
  trust_flow?: number
  citation_flow?: number
  anchor_text?: string
  link_type?: string
  referral_traffic?: number
  metadata?: Record<string, any>
}

export interface SEOPageInput {
  url: string
  title?: string
  meta_description?: string
  page_speed_score?: number
  mobile_score?: number
  core_web_vitals_score?: number
  word_count?: number
  heading_structure?: Record<string, any>
  image_count?: number
  internal_links?: number
  external_links?: number
  is_indexed?: boolean
  has_sitemap?: boolean
  has_robots?: boolean
  has_canonical?: boolean
  has_structured_data?: boolean
  issues?: any[]
  recommendations?: any[]
  metadata?: Record<string, any>
}

// Keyword Actions
export async function createSEOKeyword(input: SEOKeywordInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_keywords')
    .insert([{
      ...input,
      user_id: user.id,
      is_tracking: input.is_tracking ?? true,
      position_change: 0,
      trend: 'stable',
      actual_traffic: 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function updateSEOKeyword(id: string, updates: Partial<SEOKeywordInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_keywords')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function deleteSEOKeyword(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('seo_keywords')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return { success: true }
}

export async function updateKeywordRanking(id: string, newPosition: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current keyword
  const { data: keyword } = await supabase
    .from('seo_keywords')
    .select('current_position, best_position')
    .eq('id', id)
    .single()

  if (!keyword) throw new Error('Keyword not found')

  const positionChange = (keyword.current_position || 0) - newPosition
  const trend = positionChange > 0 ? 'up' : positionChange < 0 ? 'down' : 'stable'
  const bestPosition = Math.min(newPosition, keyword.best_position || newPosition)

  const { data, error } = await supabase
    .from('seo_keywords')
    .update({
      previous_position: keyword.current_position,
      current_position: newPosition,
      position_change: positionChange,
      trend,
      best_position: bestPosition,
      last_checked_at: new Date().toISOString(),
      first_ranked_at: keyword.current_position === null ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function getSEOKeywords() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('seo_keywords')
    .select('*')
    .eq('user_id', user.id)
    .order('search_volume', { ascending: false })

  if (error) throw error
  return data || []
}

// Backlink Actions
export async function createSEOBacklink(input: SEOBacklinkInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_backlinks')
    .insert([{
      ...input,
      user_id: user.id,
      is_active: true,
      link_type: input.link_type || 'dofollow',
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function updateSEOBacklink(id: string, updates: Partial<SEOBacklinkInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_backlinks')
    .update({
      ...updates,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function markBacklinkLost(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_backlinks')
    .update({
      is_active: false,
      lost_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function getSEOBacklinks() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('seo_backlinks')
    .select('*')
    .eq('user_id', user.id)
    .order('domain_authority', { ascending: false })

  if (error) throw error
  return data || []
}

// Page Actions
export async function createSEOPage(input: SEOPageInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_pages')
    .insert([{
      ...input,
      user_id: user.id,
      organic_traffic: 0,
      impressions: 0,
      clicks: 0,
      avg_session_duration: 0,
      is_indexed: input.is_indexed ?? true,
      has_sitemap: input.has_sitemap ?? true,
      has_robots: input.has_robots ?? true,
      has_canonical: input.has_canonical ?? true
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function updateSEOPage(id: string, updates: Partial<SEOPageInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('seo_pages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function crawlPage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // In a real implementation, this would trigger a crawl job
  const { data, error } = await supabase
    .from('seo_pages')
    .update({
      last_crawled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/seo-v2')
  return data
}

export async function getSEOPages() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('seo_pages')
    .select('*')
    .eq('user_id', user.id)
    .order('organic_traffic', { ascending: false })

  if (error) throw error
  return data || []
}
