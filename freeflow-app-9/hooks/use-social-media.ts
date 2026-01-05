'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type Platform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface SocialPost {
  id: string
  content: string
  platforms: Platform[]
  status: PostStatus
  media: PostMedia[]
  scheduledAt?: string
  publishedAt?: string
  publishedPosts: PublishedPost[]
  hashtags: string[]
  mentions: string[]
  link?: string
  linkPreview?: LinkPreview
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface PostMedia {
  id: string
  type: 'image' | 'video' | 'gif'
  url: string
  thumbnailUrl?: string
  altText?: string
}

export interface PublishedPost {
  platform: Platform
  postId: string
  url: string
  metrics: PostMetrics
  publishedAt: string
}

export interface PostMetrics {
  impressions: number
  reach: number
  engagement: number
  likes: number
  comments: number
  shares: number
  clicks: number
  saves: number
}

export interface LinkPreview {
  url: string
  title: string
  description?: string
  image?: string
}

export interface SocialAccount {
  id: string
  platform: Platform
  username: string
  displayName: string
  avatar?: string
  followers: number
  isConnected: boolean
  lastSyncedAt?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
}

export interface SocialAnalytics {
  platform: Platform
  followers: number
  followersGrowth: number
  engagement: number
  engagementGrowth: number
  reach: number
  reachGrowth: number
  impressions: number
  posts: number
  topPosts: { postId: string; engagement: number }[]
  dailyMetrics: { date: string; followers: number; engagement: number; reach: number }[]
}

export interface SocialStats {
  totalFollowers: number
  totalEngagement: number
  totalReach: number
  scheduledPosts: number
  publishedThisWeek: number
  bestPerformingPlatform: Platform
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPosts: SocialPost[] = [
  { id: 'post-1', content: '🚀 Excited to announce our new features! Check out the latest updates to our platform. #ProductUpdate #Innovation', platforms: ['twitter', 'linkedin'], status: 'published', media: [{ id: 'm1', type: 'image', url: '/media/feature-launch.jpg', altText: 'New features screenshot' }], publishedAt: '2024-03-18T10:00:00Z', publishedPosts: [{ platform: 'twitter', postId: 'tw-123', url: 'https://twitter.com/..', metrics: { impressions: 5200, reach: 4800, engagement: 320, likes: 180, comments: 45, shares: 62, clicks: 95, saves: 28 }, publishedAt: '2024-03-18T10:00:00Z' }], hashtags: ['ProductUpdate', 'Innovation'], mentions: [], createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-17', updatedAt: '2024-03-18' },
  { id: 'post-2', content: 'Join us for our upcoming webinar on productivity tips! 📅 March 25th at 2PM EST. Link in bio.', platforms: ['instagram', 'facebook'], status: 'scheduled', media: [{ id: 'm2', type: 'image', url: '/media/webinar.jpg' }], scheduledAt: '2024-03-22T14:00:00Z', publishedPosts: [], hashtags: ['Webinar', 'Productivity', 'Learning'], mentions: [], link: 'https://example.com/webinar', linkPreview: { url: 'https://example.com/webinar', title: 'Productivity Webinar', description: 'Learn how to boost your productivity' }, createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-03-19', updatedAt: '2024-03-19' },
  { id: 'post-3', content: 'Behind the scenes at our team retreat! 🏔️', platforms: ['instagram'], status: 'draft', media: [{ id: 'm3', type: 'image', url: '/media/retreat1.jpg' }, { id: 'm4', type: 'image', url: '/media/retreat2.jpg' }], publishedPosts: [], hashtags: ['TeamBuilding', 'CompanyCulture'], mentions: [], createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-03-20', updatedAt: '2024-03-20' }
]

const mockAccounts: SocialAccount[] = [
  { id: 'acc-1', platform: 'twitter', username: '@companyname', displayName: 'Company Name', avatar: '/avatars/twitter.jpg', followers: 15200, isConnected: true, lastSyncedAt: '2024-03-20T12:00:00Z' },
  { id: 'acc-2', platform: 'linkedin', username: 'company-name', displayName: 'Company Name', avatar: '/avatars/linkedin.jpg', followers: 8500, isConnected: true, lastSyncedAt: '2024-03-20T12:00:00Z' },
  { id: 'acc-3', platform: 'instagram', username: '@companyname', displayName: 'Company Name', avatar: '/avatars/instagram.jpg', followers: 25800, isConnected: true, lastSyncedAt: '2024-03-20T12:00:00Z' },
  { id: 'acc-4', platform: 'facebook', username: 'companyname', displayName: 'Company Name Page', followers: 12400, isConnected: true, lastSyncedAt: '2024-03-20T11:00:00Z' },
  { id: 'acc-5', platform: 'tiktok', username: '@companyname', displayName: 'Company Name', followers: 0, isConnected: false }
]

const mockAnalytics: SocialAnalytics[] = [
  { platform: 'twitter', followers: 15200, followersGrowth: 5.2, engagement: 4.5, engagementGrowth: 12, reach: 45000, reachGrowth: 8, impressions: 125000, posts: 24, topPosts: [], dailyMetrics: [] },
  { platform: 'instagram', followers: 25800, followersGrowth: 8.5, engagement: 6.2, engagementGrowth: 15, reach: 68000, reachGrowth: 12, impressions: 180000, posts: 18, topPosts: [], dailyMetrics: [] }
]

const mockStats: SocialStats = {
  totalFollowers: 61900,
  totalEngagement: 5.2,
  totalReach: 158000,
  scheduledPosts: 5,
  publishedThisWeek: 12,
  bestPerformingPlatform: 'instagram'
}

// ============================================================================
// HOOK
// ============================================================================

interface UseSocialMediaOptions {
  
}

export function useSocialMedia(options: UseSocialMediaOptions = {}) {
  const {  } = options

  const [posts, setPosts] = useState<SocialPost[]>([])
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [analytics, setAnalytics] = useState<SocialAnalytics[]>([])
  const [currentPost, setCurrentPost] = useState<SocialPost | null>(null)
  const [stats, setStats] = useState<SocialStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSocialData = useCallback(async () => {
    }, [])

  const updatePost = useCallback(async (postId: string, updates: Partial<SocialPost>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    return { success: true }
  }, [])

  const deletePost = useCallback(async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    return { success: true }
  }, [])

  const publishPost = useCallback(async (postId: string) => {
    setIsPublishing(true)
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return { success: false, error: 'Post not found' }

      const publishedPosts: PublishedPost[] = post.platforms.map(platform => ({
        platform,
        postId: `${platform}-${Date.now()}`,
        url: `https://${platform}.com/post/${Date.now()}`,
        metrics: { impressions: 0, reach: 0, engagement: 0, likes: 0, comments: 0, shares: 0, clicks: 0, saves: 0 },
        publishedAt: new Date().toISOString()
      }))

      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'published' as const, publishedAt: new Date().toISOString(), publishedPosts, updatedAt: new Date().toISOString() } : p))
      return { success: true }
    } finally {
      setIsPublishing(false)
    }
  }, [posts])

  const schedulePost = useCallback(async (postId: string, scheduledAt: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'scheduled' as const, scheduledAt, updatedAt: new Date().toISOString() } : p))
    return { success: true }
  }, [])

  const duplicatePost = useCallback(async (postId: string) => {
    const original = posts.find(p => p.id === postId)
    if (!original) return { success: false, error: 'Post not found' }

    const duplicate: SocialPost = {
      ...original,
      id: `post-${Date.now()}`,
      status: 'draft',
      scheduledAt: undefined,
      publishedAt: undefined,
      publishedPosts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setPosts(prev => [duplicate, ...prev])
    return { success: true, post: duplicate }
  }, [posts])

  const addMedia = useCallback(async (postId: string, file: File): Promise<PostMedia> => {
    const media: PostMedia = {
      id: `media-${Date.now()}`,
      type: file.type.startsWith('video/') ? 'video' : file.type.includes('gif') ? 'gif' : 'image',
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file)
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, media: [...p.media, media] } : p))
    return media
  }, [])

  const removeMedia = useCallback(async (postId: string, mediaId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, media: p.media.filter(m => m.id !== mediaId) } : p))
    return { success: true }
  }, [])

  const connectAccount = useCallback(async (platform: Platform) => {
    // In real implementation, this would trigger OAuth flow
    const newAccount: SocialAccount = {
      id: `acc-${Date.now()}`,
      platform,
      username: `@username`,
      displayName: 'Connected Account',
      followers: 0,
      isConnected: true,
      lastSyncedAt: new Date().toISOString()
    }
    setAccounts(prev => prev.map(a => a.platform === platform ? { ...a, isConnected: true, lastSyncedAt: new Date().toISOString() } : a))
    return { success: true, account: newAccount }
  }, [])

  const disconnectAccount = useCallback(async (accountId: string) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, isConnected: false, accessToken: undefined, refreshToken: undefined } : a))
    return { success: true }
  }, [])

  const syncAccount = useCallback(async (accountId: string) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, lastSyncedAt: new Date().toISOString() } : a))
    return { success: true }
  }, [])

  const fetchLinkPreview = useCallback(async (url: string): Promise<LinkPreview | null> => {
    // Mock implementation
    return {
      url,
      title: 'Page Title',
      description: 'Page description...',
      image: '/previews/default.jpg'
    }
  }, [])

  const extractHashtags = useCallback((content: string): string[] => {
    const matches = content.match(/#\w+/g)
    return matches ? matches.map(h => h.slice(1)) : []
  }, [])

  const extractMentions = useCallback((content: string): string[] => {
    const matches = content.match(/@\w+/g)
    return matches ? matches.map(m => m.slice(1)) : []
  }, [])

  const getCharacterCount = useCallback((content: string, platform: Platform): { count: number; limit: number; remaining: number } => {
    const limits: Record<Platform, number> = {
      twitter: 280,
      facebook: 63206,
      instagram: 2200,
      linkedin: 3000,
      tiktok: 2200,
      youtube: 5000
    }
    const limit = limits[platform]
    const count = content.length
    return { count, limit, remaining: limit - count }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSocialData()
  }, [fetchSocialData])

  useEffect(() => { refresh() }, [refresh])

  const draftPosts = useMemo(() => posts.filter(p => p.status === 'draft'), [posts])
  const scheduledPosts = useMemo(() => posts.filter(p => p.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()), [posts])
  const publishedPosts = useMemo(() => posts.filter(p => p.status === 'published').sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()), [posts])
  const connectedAccounts = useMemo(() => accounts.filter(a => a.isConnected), [accounts])
  const disconnectedAccounts = useMemo(() => accounts.filter(a => !a.isConnected), [accounts])
  const platforms: Platform[] = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube']

  return {
    posts, accounts, analytics, currentPost, stats, draftPosts, scheduledPosts, publishedPosts, connectedAccounts, disconnectedAccounts, platforms,
    isLoading, isPublishing, error,
    refresh, createPost, updatePost, deletePost, publishPost, schedulePost, duplicatePost,
    addMedia, removeMedia, connectAccount, disconnectAccount, syncAccount,
    fetchLinkPreview, extractHashtags, extractMentions, getCharacterCount,
    setCurrentPost
  }
}

export default useSocialMedia
