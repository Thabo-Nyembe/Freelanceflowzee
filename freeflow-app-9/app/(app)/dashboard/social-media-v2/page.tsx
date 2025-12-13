"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  Share2, Heart, MessageCircle, TrendingUp, Plus,
  Send, Eye, Download, RefreshCw, Settings,
  CheckCircle, Clock, Users, BarChart3
} from 'lucide-react'

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
type Platform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'
type ContentType = 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel'

interface SocialPost {
  id: string
  content: string
  contentType: ContentType
  platforms: Platform[]
  status: PostStatus
  author: string
  scheduledDate?: string
  publishedDate?: string
  likes: number
  comments: number
  shares: number
  views: number
  engagement: number
  reach: number
  clicks: number
  hasHashtags: boolean
  hasMentions: boolean
  tags: string[]
}

const posts: SocialPost[] = [
  {
    id: 'SOC-2847',
    content: 'Excited to announce our new AI-powered analytics dashboard! 🚀 Experience real-time insights like never before. Try it now!',
    contentType: 'video',
    platforms: ['twitter', 'linkedin', 'facebook'],
    status: 'published',
    author: 'Marketing Team',
    publishedDate: '2024-01-12T10:00:00',
    likes: 2847,
    comments: 456,
    shares: 892,
    views: 45678,
    engagement: 8.9,
    reach: 124567,
    clicks: 3456,
    hasHashtags: true,
    hasMentions: false,
    tags: ['Product Launch', 'AI', 'Analytics', 'Video']
  },
  {
    id: 'SOC-2846',
    content: 'Customer success story: How @TechStartupXYZ increased productivity by 300% using our platform. Read the full case study!',
    contentType: 'image',
    platforms: ['linkedin', 'twitter'],
    status: 'published',
    author: 'Content Team',
    publishedDate: '2024-01-11T14:00:00',
    likes: 1678,
    comments: 234,
    shares: 567,
    views: 28934,
    engagement: 7.2,
    reach: 89456,
    clicks: 2134,
    hasHashtags: true,
    hasMentions: true,
    tags: ['Case Study', 'Customer Success', 'B2B']
  },
  {
    id: 'SOC-2845',
    content: '🎉 We hit 100K followers! Thank you for being part of our journey. Special giveaway coming soon!',
    contentType: 'carousel',
    platforms: ['instagram', 'facebook', 'tiktok'],
    status: 'published',
    author: 'Social Media Manager',
    publishedDate: '2024-01-10T16:00:00',
    likes: 4289,
    comments: 1247,
    shares: 2156,
    views: 156789,
    engagement: 12.4,
    reach: 234567,
    clicks: 5678,
    hasHashtags: true,
    hasMentions: false,
    tags: ['Milestone', 'Community', 'Giveaway', 'Engagement']
  },
  {
    id: 'SOC-2844',
    content: 'Behind the scenes: A day in the life of our engineering team. Swipe to see how we build world-class software! 💻',
    contentType: 'story',
    platforms: ['instagram', 'facebook'],
    status: 'published',
    author: 'Brand Team',
    publishedDate: '2024-01-09T11:00:00',
    likes: 892,
    comments: 134,
    shares: 289,
    views: 12847,
    engagement: 6.8,
    reach: 45678,
    clicks: 847,
    hasHashtags: true,
    hasMentions: true,
    tags: ['Behind the Scenes', 'Company Culture', 'Story']
  },
  {
    id: 'SOC-2843',
    content: 'Quick tutorial: 3 ways to optimize your workflow using our new automation features. Link in bio! 🔗',
    contentType: 'reel',
    platforms: ['instagram', 'tiktok', 'youtube'],
    status: 'published',
    author: 'Product Marketing',
    publishedDate: '2024-01-08T15:00:00',
    likes: 3456,
    comments: 678,
    shares: 1234,
    views: 89456,
    engagement: 10.3,
    reach: 178934,
    clicks: 4289,
    hasHashtags: true,
    hasMentions: false,
    tags: ['Tutorial', 'Product', 'Automation', 'Short Form']
  },
  {
    id: 'SOC-2842',
    content: 'Join us for our exclusive webinar on "Future of SaaS Analytics" - January 18th at 2 PM EST. Register now!',
    contentType: 'image',
    platforms: ['linkedin', 'twitter', 'facebook'],
    status: 'scheduled',
    author: 'Events Team',
    scheduledDate: '2024-01-15T09:00:00',
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    engagement: 0,
    reach: 0,
    clicks: 0,
    hasHashtags: true,
    hasMentions: false,
    tags: ['Webinar', 'Event', 'SaaS', 'Scheduled']
  },
  {
    id: 'SOC-2841',
    content: 'Monday motivation: "The best time to plant a tree was 20 years ago. The second best time is now." Start building today! 🌱',
    contentType: 'text',
    platforms: ['twitter', 'linkedin'],
    status: 'published',
    author: 'Social Media Manager',
    publishedDate: '2024-01-08T09:00:00',
    likes: 567,
    comments: 89,
    shares: 234,
    views: 8934,
    engagement: 4.2,
    reach: 34567,
    clicks: 456,
    hasHashtags: true,
    hasMentions: false,
    tags: ['Motivation', 'Monday', 'Inspiration']
  },
  {
    id: 'SOC-2840',
    content: 'New blog post: "10 Data-Driven Strategies to Scale Your Business in 2024" - Read now on our website!',
    contentType: 'image',
    platforms: ['linkedin', 'twitter', 'facebook'],
    status: 'failed',
    author: 'Content Team',
    scheduledDate: '2024-01-07T13:00:00',
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    engagement: 0,
    reach: 0,
    clicks: 0,
    hasHashtags: true,
    hasMentions: false,
    tags: ['Blog', 'Content', 'Strategy', 'Failed']
  }
]

const stats = [
  {
    label: 'Total Posts',
    value: '2,847',
    change: 18.5,
    trend: 'up' as const,
    icon: Share2
  },
  {
    label: 'Total Engagement',
    value: '247K',
    change: 24.3,
    trend: 'up' as const,
    icon: Heart
  },
  {
    label: 'Avg Engagement',
    value: '8.2%',
    change: 5.7,
    trend: 'up' as const,
    icon: TrendingUp
  },
  {
    label: 'Total Followers',
    value: '124.5K',
    change: 12.8,
    trend: 'up' as const,
    icon: Users
  }
]

const quickActions = [
  { label: 'Create Post', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Publish Now', icon: Send, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Schedule Posts', icon: Clock, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'View Analytics', icon: BarChart3, gradient: 'from-orange-500 to-red-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Platform Settings', icon: Settings, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Engagement Report', icon: Eye, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'High engagement', details: 'Milestone post reached 156K views', time: '2 hours ago' },
  { action: 'Post published', details: 'AI dashboard video posted on 3 platforms', time: '1 day ago' },
  { action: 'Post scheduled', details: 'Webinar announcement scheduled for Jan 15', time: '1 day ago' },
  { action: 'Post failed', details: 'Blog post failed to publish - connection issue', time: '5 days ago' },
  { action: 'Trending', details: 'Tutorial reel trending on Instagram', time: '4 days ago' }
]

const topPosts = [
  { name: '100K Followers Milestone', metric: '156,789 views' },
  { name: 'AI Dashboard Launch Video', metric: '45,678 views' },
  { name: 'Tutorial: Automation Features', metric: '89,456 views' },
  { name: 'Customer Success Story', metric: '28,934 views' },
  { name: 'Behind the Scenes Story', metric: '12,847 views' }
]

export default function SocialMediaV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'scheduled' | 'trending'>('all')

  const filteredPosts = posts.filter(post => {
    if (viewMode === 'all') return true
    if (viewMode === 'published') return post.status === 'published'
    if (viewMode === 'scheduled') return post.status === 'scheduled'
    if (viewMode === 'trending') return post.engagement > 8
    return true
  })

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <Share2 className="w-3 h-3" />
      default: return <Share2 className="w-3 h-3" />
    }
  }

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case 'text': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'image': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'video': return 'bg-red-50 text-red-600 border-red-100'
      case 'carousel': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'story': return 'bg-pink-50 text-pink-600 border-pink-100'
      case 'reel': return 'bg-orange-50 text-orange-600 border-orange-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getContentTypeGradient = (type: ContentType) => {
    switch (type) {
      case 'text': return 'from-blue-500 to-cyan-600'
      case 'image': return 'from-purple-500 to-pink-600'
      case 'video': return 'from-red-500 to-orange-600'
      case 'carousel': return 'from-indigo-500 to-purple-600'
      case 'story': return 'from-pink-500 to-rose-600'
      case 'reel': return 'from-orange-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getPlatformIcon = (platform: Platform) => {
    const iconMap: Record<Platform, string> = {
      twitter: '𝕏',
      facebook: 'f',
      instagram: 'IG',
      linkedin: 'in',
      tiktok: 'TT',
      youtube: 'YT'
    }
    return iconMap[platform] || platform.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Social Media
            </h1>
            <p className="text-gray-600 mt-2">Manage posts across all social platforms</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Posts"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Published"
            isActive={viewMode === 'published'}
            onClick={() => setViewMode('published')}
          />
          <PillButton
            label="Scheduled"
            isActive={viewMode === 'scheduled'}
            onClick={() => setViewMode('scheduled')}
          />
          <PillButton
            label="Trending"
            isActive={viewMode === 'trending'}
            onClick={() => setViewMode('trending')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Posts List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Posts'}
              {viewMode === 'published' && 'Published Posts'}
              {viewMode === 'scheduled' && 'Scheduled Posts'}
              {viewMode === 'trending' && 'Trending Posts'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredPosts.length} total)
              </span>
            </h2>

            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)} flex items-center gap-1`}>
                        {getStatusIcon(post.status)}
                        {post.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getContentTypeColor(post.contentType)}`}>
                        {post.contentType}
                      </span>
                      {post.engagement > 8 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-orange-50 text-orange-600 border-orange-100">
                          Trending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.id} • By {post.author}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getContentTypeGradient(post.contentType)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                {/* Platforms */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {post.platforms.map((platform, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 rounded-full text-xs font-semibold border border-violet-100"
                      >
                        {getPlatformIcon(platform)} {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {post.status === 'published' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Likes</p>
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(post.likes)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Comments</p>
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(post.comments)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Shares</p>
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(post.shares)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Views</p>
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(post.views)}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Engagement Rate</span>
                          <span>{post.engagement}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getContentTypeGradient(post.contentType)} rounded-full transition-all`}
                            style={{ width: `${Math.min(post.engagement * 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Reach: {formatNumber(post.reach)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span>Clicks: {formatNumber(post.clicks)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>{formatDate(post.publishedDate!)}</span>
                      </div>
                    </div>
                  </>
                )}

                {post.status === 'scheduled' && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Scheduled for: {formatDate(post.scheduledDate!)}</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Content Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Content Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'video', count: 847, percentage: 30 },
                  { type: 'image', count: 789, percentage: 28 },
                  { type: 'reel', count: 567, percentage: 20 },
                  { type: 'carousel', count: 389, percentage: 14 },
                  { type: 'story', count: 178, percentage: 6 },
                  { type: 'text', count: 77, percentage: 2 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getContentTypeGradient(item.type as ContentType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Posts */}
            <RankingList
              title="Top Performing"
              items={topPosts}
              gradient="from-violet-500 to-fuchsia-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Reach"
              value="89.4K"
              change={15.7}
              trend="up"
            />

            <ProgressCard
              title="Monthly Goal"
              current={247}
              target={300}
              label="posts published"
              gradient="from-violet-500 to-fuchsia-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
