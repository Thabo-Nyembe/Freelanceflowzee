'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface SocialPost {
  id: string
  user_id: string
  post_code: string
  content: string
  content_type: 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'link'
  platforms: string[]
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'deleted'
  author: string | null
  media_urls: string[]
  thumbnail_url: string | null
  link_url: string | null
  link_preview: Record<string, any>
  hashtags: string[]
  mentions: string[]
  tags: string[]
  likes: number
  comments: number
  shares: number
  views: number
  saves: number
  reach: number
  impressions: number
  clicks: number
  engagement: number
  engagement_rate: number
  scheduled_at: string | null
  published_at: string | null
  failed_at: string | null
  failure_reason: string | null
  platform_post_ids: Record<string, any>
  is_trending: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest' | 'threads'
  account_name: string
  account_id: string
  account_username: string | null
  profile_url: string | null
  avatar_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  followers_count: number
  following_count: number
  posts_count: number
  is_active: boolean
  is_verified: boolean
  last_synced_at: string | null
  permissions: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SocialAnalytics {
  id: string
  user_id: string
  account_id: string | null
  platform: string
  date: string
  followers: number
  followers_change: number
  following: number
  posts: number
  total_reach: number
  total_impressions: number
  total_engagement: number
  engagement_rate: number
  profile_views: number
  website_clicks: number
  metadata: Record<string, any>
  created_at: string
}

export interface SocialMediaStats {
  totalPosts: number
  totalEngagement: number
  avgEngagementRate: number
  totalFollowers: number
  totalReach: number
  totalImpressions: number
  publishedPosts: number
  scheduledPosts: number
  draftPosts: number
  trendingPosts: number
}

export function useSocialPosts() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch posts', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createPost = async (post: Partial<SocialPost>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('social_posts')
        .insert([{ ...post, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setPosts(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Post created' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updatePost = async (id: string, updates: Partial<SocialPost>) => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPosts(prev => prev.map(p => p.id === id ? data : p))
      toast({ title: 'Success', description: 'Post updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setPosts(prev => prev.filter(p => p.id !== id))
      toast({ title: 'Success', description: 'Post deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const schedulePost = async (id: string, scheduledAt: string) => {
    return updatePost(id, { status: 'scheduled', scheduled_at: scheduledAt })
  }

  const publishPost = async (id: string) => {
    return updatePost(id, { status: 'published', published_at: new Date().toISOString() })
  }

  const getStats = useCallback((): SocialMediaStats => {
    const publishedPosts = posts.filter(p => p.status === 'published')
    return {
      totalPosts: posts.length,
      totalEngagement: publishedPosts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0),
      avgEngagementRate: publishedPosts.length > 0
        ? publishedPosts.reduce((sum, p) => sum + p.engagement_rate, 0) / publishedPosts.length
        : 0,
      totalFollowers: 0, // Will be calculated from accounts
      totalReach: publishedPosts.reduce((sum, p) => sum + p.reach, 0),
      totalImpressions: publishedPosts.reduce((sum, p) => sum + p.impressions, 0),
      publishedPosts: publishedPosts.length,
      scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      trendingPosts: posts.filter(p => p.is_trending).length
    }
  }, [posts])

  useEffect(() => {
    fetchPosts()

    const channel = supabase
      .channel('social-posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as SocialPost, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new as SocialPost : p))
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPosts, supabase])

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    getStats
  }
}

export function useSocialAccounts() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const connectAccount = async (account: Partial<SocialAccount>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('social_accounts')
        .insert([{ ...account, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setAccounts(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Account connected' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const disconnectAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAccounts(prev => prev.filter(a => a.id !== id))
      toast({ title: 'Success', description: 'Account disconnected' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const getTotalFollowers = useCallback(() => {
    return accounts.reduce((sum, a) => sum + a.followers_count, 0)
  }, [accounts])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return { accounts, loading, connectAccount, disconnectAccount, getTotalFollowers }
}

export function useSocialAnalytics(accountId?: string) {
  const supabase = createClientComponentClient()
  const [analytics, setAnalytics] = useState<SocialAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('social_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (accountId) {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query

      if (error) throw error
      setAnalytics(data || [])
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, accountId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, loading }
}
