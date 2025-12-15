'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

// Types
export type AppCategory = 'productivity' | 'analytics' | 'marketing' | 'security' | 'collaboration' | 'automation' | 'communication' | 'finance' | 'design' | 'development' | 'other'
export type PricingModel = 'free' | 'freemium' | 'paid' | 'subscription' | 'usage_based'
export type AppStatus = 'pending' | 'approved' | 'published' | 'rejected' | 'suspended' | 'archived'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'removed'

export interface MarketplaceApp {
  id: string
  user_id: string
  app_name: string
  app_slug: string | null
  description: string | null
  short_description: string | null
  developer_name: string | null
  developer_email: string | null
  developer_website: string | null
  developer_verified: boolean
  category: AppCategory
  subcategory: string | null
  tags: string[] | null
  pricing_model: PricingModel
  price: number
  currency: string
  monthly_price: number | null
  annual_price: number | null
  status: AppStatus
  is_featured: boolean
  is_verified: boolean
  is_active: boolean
  total_downloads: number
  total_installs: number
  total_reviews: number
  average_rating: number
  rating_count: number
  icon_url: string | null
  banner_url: string | null
  screenshots: string[] | null
  video_url: string | null
  version: string | null
  min_platform_version: string | null
  permissions: string[] | null
  api_scopes: string[] | null
  webhook_url: string | null
  metadata: Record<string, unknown>
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MarketplaceReview {
  id: string
  user_id: string
  app_id: string
  rating: number
  title: string | null
  content: string | null
  reviewer_name: string | null
  reviewer_avatar: string | null
  is_verified_purchase: boolean
  status: ReviewStatus
  is_featured: boolean
  helpful_count: number
  not_helpful_count: number
  reply_count: number
  developer_response: string | null
  developer_responded_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Hook Options
interface UseMarketplaceAppsOptions {
  category?: AppCategory | 'all'
  status?: AppStatus | 'all'
  featured?: boolean
  searchQuery?: string
}

interface UseMarketplaceReviewsOptions {
  appId?: string
  status?: ReviewStatus | 'all'
  rating?: number
}

// Marketplace Apps Hook
export function useMarketplaceApps(options: UseMarketplaceAppsOptions = {}) {
  const { category, status, featured, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('marketplace_apps')
      .select('*')
      .is('deleted_at', null)
      .order('total_downloads', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured)
    }

    if (searchQuery) {
      query = query.or(`app_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,developer_name.ilike.%${searchQuery}%`)
    }

    return query
  }

  const { data, loading, error, refetch } = useSupabaseQuery<MarketplaceApp>(
    'marketplace_apps',
    buildQuery,
    [category, status, featured, searchQuery]
  )

  return {
    apps: data,
    loading,
    error,
    refetch
  }
}

// Featured Apps Hook
export function useFeaturedApps() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('marketplace_apps')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('average_rating', { ascending: false })
      .limit(10)
  }

  const { data, loading, error, refetch } = useSupabaseQuery<MarketplaceApp>(
    'marketplace_apps',
    buildQuery,
    ['featured']
  )

  return {
    featuredApps: data,
    loading,
    error,
    refetch
  }
}

// App Reviews Hook
export function useMarketplaceReviews(options: UseMarketplaceReviewsOptions = {}) {
  const { appId, status, rating } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('marketplace_reviews')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (appId) {
      query = query.eq('app_id', appId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (rating) {
      query = query.eq('rating', rating)
    }

    return query
  }

  const { data, loading, error, refetch } = useSupabaseQuery<MarketplaceReview>(
    'marketplace_reviews',
    buildQuery,
    [appId, status, rating]
  )

  return {
    reviews: data,
    loading,
    error,
    refetch
  }
}

// App Categories Hook
export function useAppCategories() {
  const { apps } = useMarketplaceApps({ status: 'published' })

  const categories = [
    { name: 'productivity', label: 'Productivity', count: 0 },
    { name: 'analytics', label: 'Analytics', count: 0 },
    { name: 'marketing', label: 'Marketing', count: 0 },
    { name: 'security', label: 'Security', count: 0 },
    { name: 'collaboration', label: 'Collaboration', count: 0 },
    { name: 'automation', label: 'Automation', count: 0 },
    { name: 'communication', label: 'Communication', count: 0 },
    { name: 'finance', label: 'Finance', count: 0 },
    { name: 'design', label: 'Design', count: 0 },
    { name: 'development', label: 'Development', count: 0 },
    { name: 'other', label: 'Other', count: 0 }
  ]

  // Count apps per category
  apps.forEach(app => {
    const category = categories.find(c => c.name === app.category)
    if (category) {
      category.count++
    }
  })

  return { categories: categories.filter(c => c.count > 0) }
}

// Marketplace Mutations
export function useMarketplaceMutations() {
  const createApp = useSupabaseMutation<Partial<MarketplaceApp>>('marketplace_apps', 'INSERT')
  const updateApp = useSupabaseMutation<Partial<MarketplaceApp>>('marketplace_apps', 'UPDATE')
  const deleteApp = useSupabaseMutation<{ id: string }>('marketplace_apps', 'DELETE')

  const createReview = useSupabaseMutation<Partial<MarketplaceReview>>('marketplace_reviews', 'INSERT')
  const updateReview = useSupabaseMutation<Partial<MarketplaceReview>>('marketplace_reviews', 'UPDATE')
  const deleteReview = useSupabaseMutation<{ id: string }>('marketplace_reviews', 'DELETE')

  return {
    createApp,
    updateApp,
    deleteApp,
    createReview,
    updateReview,
    deleteReview
  }
}
