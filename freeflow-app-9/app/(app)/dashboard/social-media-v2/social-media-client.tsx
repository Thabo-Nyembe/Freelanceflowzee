'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Share2,
  Heart,
  MessageCircle,
  TrendingUp,
  Plus,
  Send,
  Eye,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  RefreshCw,
  Trash2,
  Image,
  Video,
  FileText,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Inbox,
  Hash,
  AtSign,
  Bell,
  Settings,
  Target,
  Zap,
  Globe,
  Repeat2,
  Bookmark,
  Link2,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Layers,
  PenTool,
  Palette,
  Music2,
  Film,
  Camera,
  Mic,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Copy,
  Download,
  Upload,
  Folder,
  Star,
  Award,
  TrendingDown,
  Activity
} from 'lucide-react'

// Types
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'pending_approval'
type ContentType = 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'thread' | 'poll'
type Platform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest'
type EngagementType = 'like' | 'comment' | 'share' | 'save' | 'click' | 'view'
type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft'
type MentionSentiment = 'positive' | 'neutral' | 'negative'

interface SocialPost {
  id: string
  content: string
  contentType: ContentType
  platforms: Platform[]
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  mediaUrls: string[]
  hashtags: string[]
  mentions: string[]
  link: string | null
  likes: number
  comments: number
  shares: number
  saves: number
  views: number
  clicks: number
  engagementRate: number
  reach: number
  impressions: number
  isTrending: boolean
  createdBy: string
  approvedBy: string | null
}

interface SocialAccount {
  id: string
  platform: Platform
  username: string
  displayName: string
  avatar: string
  followers: number
  following: number
  posts: number
  isVerified: boolean
  isConnected: boolean
  lastSync: string
  engagementRate: number
}

interface Campaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  startDate: string
  endDate: string
  budget: number
  spent: number
  posts: number
  reach: number
  engagement: number
  conversions: number
  hashtags: string[]
}

interface Mention {
  id: string
  platform: Platform
  username: string
  avatar: string
  content: string
  sentiment: MentionSentiment
  followers: number
  timestamp: string
  isReplied: boolean
  postUrl: string
}

interface ContentAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'graphic'
  url: string
  thumbnail: string
  size: number
  dimensions: string
  createdAt: string
  usageCount: number
  tags: string[]
}

interface Hashtag {
  id: string
  tag: string
  posts: number
  reach: number
  engagement: number
  trend: 'up' | 'down' | 'stable'
  competitors: number
}

// Mock Data
const mockPosts: SocialPost[] = [
  {
    id: '1',
    content: 'Excited to announce our new product launch! 🚀 Stay tuned for more updates. #innovation #tech #launch',
    contentType: 'image',
    platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
    status: 'published',
    scheduledAt: null,
    publishedAt: '2024-01-15T10:00:00Z',
    mediaUrls: ['/posts/product-launch.jpg'],
    hashtags: ['innovation', 'tech', 'launch'],
    mentions: ['@techcrunch', '@producthunt'],
    link: 'https://example.com/launch',
    likes: 1523,
    comments: 234,
    shares: 156,
    saves: 89,
    views: 25400,
    clicks: 1245,
    engagementRate: 8.5,
    reach: 45000,
    impressions: 78000,
    isTrending: true,
    createdBy: 'Sarah Johnson',
    approvedBy: 'Mike Chen'
  },
  {
    id: '2',
    content: 'Behind the scenes look at our team working on the next big thing! 👀 #teamwork #behindthescenes',
    contentType: 'video',
    platforms: ['instagram', 'tiktok', 'youtube'],
    status: 'published',
    scheduledAt: null,
    publishedAt: '2024-01-14T15:30:00Z',
    mediaUrls: ['/posts/bts-video.mp4'],
    hashtags: ['teamwork', 'behindthescenes'],
    mentions: [],
    link: null,
    likes: 2890,
    comments: 445,
    shares: 234,
    saves: 178,
    views: 45600,
    clicks: 890,
    engagementRate: 9.2,
    reach: 52000,
    impressions: 89000,
    isTrending: true,
    createdBy: 'Alex Rivera',
    approvedBy: 'Sarah Johnson'
  },
  {
    id: '3',
    content: 'Join us for our upcoming webinar on digital transformation. Link in bio! 📅',
    contentType: 'carousel',
    platforms: ['linkedin', 'twitter', 'facebook'],
    status: 'scheduled',
    scheduledAt: '2024-01-20T14:00:00Z',
    publishedAt: null,
    mediaUrls: ['/posts/webinar-1.jpg', '/posts/webinar-2.jpg', '/posts/webinar-3.jpg'],
    hashtags: ['webinar', 'digital', 'transformation'],
    mentions: ['@microsoft', '@google'],
    link: 'https://example.com/webinar',
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    views: 0,
    clicks: 0,
    engagementRate: 0,
    reach: 0,
    impressions: 0,
    isTrending: false,
    createdBy: 'Jordan Lee',
    approvedBy: null
  },
  {
    id: '4',
    content: 'Customer success story: How Company X increased their revenue by 200%! 📈',
    contentType: 'text',
    platforms: ['twitter', 'linkedin'],
    status: 'pending_approval',
    scheduledAt: '2024-01-18T09:00:00Z',
    publishedAt: null,
    mediaUrls: [],
    hashtags: ['success', 'casestudy', 'growth'],
    mentions: ['@companyx'],
    link: 'https://example.com/case-study',
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    views: 0,
    clicks: 0,
    engagementRate: 0,
    reach: 0,
    impressions: 0,
    isTrending: false,
    createdBy: 'Emily Davis',
    approvedBy: null
  },
  {
    id: '5',
    content: 'Happy Friday! What are your plans for the weekend? Drop a comment below! 🎉',
    contentType: 'poll',
    platforms: ['twitter', 'instagram'],
    status: 'draft',
    scheduledAt: null,
    publishedAt: null,
    mediaUrls: [],
    hashtags: ['fridayvibes', 'weekend'],
    mentions: [],
    link: null,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    views: 0,
    clicks: 0,
    engagementRate: 0,
    reach: 0,
    impressions: 0,
    isTrending: false,
    createdBy: 'Chris Taylor',
    approvedBy: null
  }
]

const mockAccounts: SocialAccount[] = [
  { id: '1', platform: 'twitter', username: '@ourcompany', displayName: 'Our Company', avatar: '/avatars/twitter.png', followers: 45200, following: 1200, posts: 3450, isVerified: true, isConnected: true, lastSync: '2024-01-15T12:00:00Z', engagementRate: 4.5 },
  { id: '2', platform: 'facebook', username: 'ourcompany', displayName: 'Our Company', avatar: '/avatars/facebook.png', followers: 125000, following: 0, posts: 2100, isVerified: true, isConnected: true, lastSync: '2024-01-15T12:00:00Z', engagementRate: 3.2 },
  { id: '3', platform: 'instagram', username: '@our.company', displayName: 'Our Company', avatar: '/avatars/instagram.png', followers: 89500, following: 450, posts: 1890, isVerified: true, isConnected: true, lastSync: '2024-01-15T12:00:00Z', engagementRate: 6.8 },
  { id: '4', platform: 'linkedin', username: 'our-company', displayName: 'Our Company', avatar: '/avatars/linkedin.png', followers: 35000, following: 200, posts: 890, isVerified: false, isConnected: true, lastSync: '2024-01-15T12:00:00Z', engagementRate: 5.1 },
  { id: '5', platform: 'tiktok', username: '@ourcompany', displayName: 'Our Company', avatar: '/avatars/tiktok.png', followers: 156000, following: 50, posts: 245, isVerified: true, isConnected: true, lastSync: '2024-01-15T12:00:00Z', engagementRate: 12.3 },
  { id: '6', platform: 'youtube', username: 'OurCompanyOfficial', displayName: 'Our Company', avatar: '/avatars/youtube.png', followers: 78000, following: 0, posts: 180, isVerified: true, isConnected: true, lastSync: '2024-01-15T12:00:00Z', engagementRate: 7.5 }
]

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Product Launch 2024', description: 'Q1 product launch campaign', status: 'active', startDate: '2024-01-01', endDate: '2024-01-31', budget: 10000, spent: 6500, posts: 25, reach: 450000, engagement: 45000, conversions: 1250, hashtags: ['launch2024', 'newproduct'] },
  { id: '2', name: 'Brand Awareness', description: 'Ongoing brand awareness initiative', status: 'active', startDate: '2024-01-01', endDate: '2024-03-31', budget: 25000, spent: 8500, posts: 45, reach: 890000, engagement: 78000, conversions: 3200, hashtags: ['brandawareness', 'ourcompany'] },
  { id: '3', name: 'Holiday Promo', description: 'End of year holiday promotion', status: 'completed', startDate: '2023-12-01', endDate: '2023-12-31', budget: 15000, spent: 14500, posts: 35, reach: 650000, engagement: 52000, conversions: 2800, hashtags: ['holiday', 'promo'] },
  { id: '4', name: 'Q2 Content Plan', description: 'Q2 content strategy', status: 'draft', startDate: '2024-04-01', endDate: '2024-06-30', budget: 20000, spent: 0, posts: 0, reach: 0, engagement: 0, conversions: 0, hashtags: ['Q2', 'content'] }
]

const mockMentions: Mention[] = [
  { id: '1', platform: 'twitter', username: '@happycustomer', avatar: '/mentions/user1.jpg', content: 'Just tried @ourcompany product and absolutely love it! Best purchase ever! 💯', sentiment: 'positive', followers: 12500, timestamp: '2024-01-15T11:30:00Z', isReplied: true, postUrl: 'https://twitter.com/status/1' },
  { id: '2', platform: 'instagram', username: '@influencer_jane', avatar: '/mentions/user2.jpg', content: 'Partnering with @our.company for this amazing giveaway! Stay tuned 🎁', sentiment: 'positive', followers: 89000, timestamp: '2024-01-15T10:15:00Z', isReplied: false, postUrl: 'https://instagram.com/p/2' },
  { id: '3', platform: 'twitter', username: '@techreviewer', avatar: '/mentions/user3.jpg', content: 'The new update from @ourcompany has some issues. Hoping they fix it soon.', sentiment: 'negative', followers: 45000, timestamp: '2024-01-15T09:00:00Z', isReplied: true, postUrl: 'https://twitter.com/status/3' },
  { id: '4', platform: 'linkedin', username: 'industry_expert', avatar: '/mentions/user4.jpg', content: 'Great insights from the Our Company team on digital transformation.', sentiment: 'neutral', followers: 25000, timestamp: '2024-01-14T16:45:00Z', isReplied: false, postUrl: 'https://linkedin.com/post/4' },
  { id: '5', platform: 'facebook', username: 'Local Business', avatar: '/mentions/user5.jpg', content: 'We highly recommend Our Company for all your needs!', sentiment: 'positive', followers: 5600, timestamp: '2024-01-14T14:20:00Z', isReplied: true, postUrl: 'https://facebook.com/post/5' }
]

const mockAssets: ContentAsset[] = [
  { id: '1', name: 'Product Hero Image', type: 'image', url: '/assets/hero.jpg', thumbnail: '/assets/hero-thumb.jpg', size: 2.5e6, dimensions: '1920x1080', createdAt: '2024-01-10T09:00:00Z', usageCount: 12, tags: ['product', 'hero', 'launch'] },
  { id: '2', name: 'Team Video', type: 'video', url: '/assets/team.mp4', thumbnail: '/assets/team-thumb.jpg', size: 45e6, dimensions: '1920x1080', createdAt: '2024-01-08T11:00:00Z', usageCount: 5, tags: ['team', 'culture', 'bts'] },
  { id: '3', name: 'Logo Pack', type: 'graphic', url: '/assets/logo-pack.zip', thumbnail: '/assets/logo-thumb.png', size: 8e6, dimensions: 'Various', createdAt: '2024-01-05T08:00:00Z', usageCount: 25, tags: ['logo', 'branding'] },
  { id: '4', name: 'Podcast Intro', type: 'audio', url: '/assets/intro.mp3', thumbnail: '/assets/audio-thumb.png', size: 3.5e6, dimensions: 'N/A', createdAt: '2024-01-12T14:00:00Z', usageCount: 8, tags: ['podcast', 'audio', 'intro'] }
]

const mockHashtags: Hashtag[] = [
  { id: '1', tag: '#innovation', posts: 125, reach: 450000, engagement: 45000, trend: 'up', competitors: 8 },
  { id: '2', tag: '#tech', posts: 89, reach: 320000, engagement: 28000, trend: 'stable', competitors: 12 },
  { id: '3', tag: '#launch2024', posts: 45, reach: 180000, engagement: 15000, trend: 'up', competitors: 3 },
  { id: '4', tag: '#digital', posts: 67, reach: 250000, engagement: 22000, trend: 'down', competitors: 15 },
  { id: '5', tag: '#success', posts: 34, reach: 120000, engagement: 9500, trend: 'stable', competitors: 6 }
]

export default function SocialMediaClient() {
  const [posts] = useState<SocialPost[]>(mockPosts)
  const [accounts] = useState<SocialAccount[]>(mockAccounts)
  const [campaigns] = useState<Campaign[]>(mockCampaigns)
  const [mentions] = useState<Mention[]>(mockMentions)
  const [assets] = useState<ContentAsset[]>(mockAssets)
  const [hashtags] = useState<Hashtag[]>(mockHashtags)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null)
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats
  const stats = useMemo(() => {
    const totalPosts = posts.length
    const publishedPosts = posts.filter(p => p.status === 'published').length
    const scheduledPosts = posts.filter(p => p.status === 'scheduled').length
    const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0)
    const totalEngagement = posts.filter(p => p.status === 'published').reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0)
    const avgEngagementRate = posts.filter(p => p.status === 'published').reduce((sum, p) => sum + p.engagementRate, 0) / publishedPosts || 0
    const totalReach = posts.filter(p => p.status === 'published').reduce((sum, p) => sum + p.reach, 0)
    const trendingPosts = posts.filter(p => p.isTrending).length
    return { totalPosts, publishedPosts, scheduledPosts, totalFollowers, totalEngagement, avgEngagementRate, totalReach, trendingPosts }
  }, [posts, accounts])

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter
      const matchesPlatform = platformFilter === 'all' || post.platforms.includes(platformFilter)
      return matchesSearch && matchesStatus && matchesPlatform
    })
  }, [posts, searchQuery, statusFilter, platformFilter])

  // Helper functions
  const getStatusColor = (status: PostStatus) => {
    const colors: Record<PostStatus, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return colors[status]
  }

  const getStatusIcon = (status: PostStatus) => {
    const icons: Record<PostStatus, React.ReactNode> = {
      draft: <PenTool className="w-3 h-3" />,
      scheduled: <Clock className="w-3 h-3" />,
      published: <CheckCircle2 className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      pending_approval: <PauseCircle className="w-3 h-3" />
    }
    return icons[status]
  }

  const getPlatformColor = (platform: Platform) => {
    const colors: Record<Platform, string> = {
      twitter: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      facebook: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      linkedin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      tiktok: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      youtube: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pinterest: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    }
    return colors[platform]
  }

  const getContentTypeIcon = (type: ContentType) => {
    const icons: Record<ContentType, React.ReactNode> = {
      text: <FileText className="w-4 h-4" />,
      image: <Image className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      carousel: <Layers className="w-4 h-4" />,
      story: <Camera className="w-4 h-4" />,
      reel: <Film className="w-4 h-4" />,
      thread: <MessageSquare className="w-4 h-4" />,
      poll: <BarChart3 className="w-4 h-4" />
    }
    return icons[type]
  }

  const getSentimentColor = (sentiment: MentionSentiment) => {
    const colors: Record<MentionSentiment, string> = {
      positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[sentiment]
  }

  const getCampaignStatusColor = (status: CampaignStatus) => {
    const colors: Record<CampaignStatus, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[status]
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`
    return `${bytes} B`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts.toString(), change: 18.5, icon: Share2, color: 'from-violet-500 to-purple-500' },
    { label: 'Total Followers', value: formatNumber(stats.totalFollowers), change: 12.8, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Engagement', value: formatNumber(stats.totalEngagement), change: 24.3, icon: Heart, color: 'from-pink-500 to-rose-500' },
    { label: 'Avg Rate', value: `${stats.avgEngagementRate.toFixed(1)}%`, change: 5.7, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Reach', value: formatNumber(stats.totalReach), change: 15.2, icon: Eye, color: 'from-orange-500 to-amber-500' },
    { label: 'Scheduled', value: stats.scheduledPosts.toString(), change: 8.0, icon: Clock, color: 'from-indigo-500 to-violet-500' },
    { label: 'Trending', value: stats.trendingPosts.toString(), change: 35.0, icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { label: 'Campaigns', value: campaigns.filter(c => c.status === 'active').length.toString(), change: 10.0, icon: Target, color: 'from-teal-500 to-green-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Media</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hootsuite-level social management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search posts, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({posts.length})
              </Button>
              {(['published', 'scheduled', 'draft', 'pending_approval'] as PostStatus[]).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.replace('_', ' ')} ({posts.filter(p => p.status === status).length})
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {filteredPosts.map(post => (
                  <Card key={post.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(post.status)}>
                            {getStatusIcon(post.status)}
                            <span className="ml-1">{post.status.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getContentTypeIcon(post.contentType)}
                            {post.contentType}
                          </Badge>
                          {post.isTrending && (
                            <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                              <Zap className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-gray-900 dark:text-white mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.platforms.map(platform => (
                          <Badge key={platform} className={getPlatformColor(platform)}>
                            {platform}
                          </Badge>
                        ))}
                      </div>

                      {post.status === 'published' && (
                        <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(post.likes)}</p>
                            <p className="text-xs text-gray-500">Likes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(post.comments)}</p>
                            <p className="text-xs text-gray-500">Comments</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(post.shares)}</p>
                            <p className="text-xs text-gray-500">Shares</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(post.views)}</p>
                            <p className="text-xs text-gray-500">Views</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(post.reach)}</p>
                            <p className="text-xs text-gray-500">Reach</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{post.engagementRate}%</p>
                            <p className="text-xs text-gray-500">Rate</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          {post.hashtags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-violet-600">#{tag}</span>
                          ))}
                        </div>
                        <span>{post.publishedAt ? formatTimeAgo(post.publishedAt) : post.scheduledAt ? `Scheduled: ${formatDate(post.scheduledAt)}` : 'Draft'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      Trending Hashtags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hashtags.map(hashtag => (
                        <div key={hashtag.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div>
                            <p className="font-medium text-violet-600">{hashtag.tag}</p>
                            <p className="text-xs text-gray-500">{hashtag.posts} posts • {formatNumber(hashtag.reach)} reach</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {hashtag.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {hashtag.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {hashtag.trend === 'stable' && <Activity className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Caption
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Hash className="w-4 h-4 mr-2" />
                      Suggest Hashtags
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Best Time to Post
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Image className="w-4 h-4 mr-2" />
                      Create Visual
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>Schedule and manage your social media content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 3
                    const hasPost = day === 15 || day === 20 || day === 18
                    const isToday = day === 15
                    return (
                      <div
                        key={i}
                        className={`aspect-square p-2 rounded-lg border ${
                          day < 1 || day > 31
                            ? 'bg-gray-50 dark:bg-gray-800 border-transparent'
                            : isToday
                            ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-500'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-violet-300'
                        }`}
                      >
                        {day >= 1 && day <= 31 && (
                          <>
                            <div className="text-xs font-medium text-gray-900 dark:text-white">{day}</div>
                            {hasPost && (
                              <div className="mt-1 flex gap-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {posts.filter(p => p.status === 'scheduled').map(post => (
                <Card key={post.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{post.scheduledAt && formatDate(post.scheduledAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex gap-1">
                      {post.platforms.map(p => (
                        <Badge key={p} className={getPlatformColor(p)} variant="outline">{p[0].toUpperCase()}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Social Mentions</CardTitle>
                    <CardDescription>Monitor and respond to mentions across platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mentions.map(mention => (
                        <div key={mention.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{mention.username[1].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white">{mention.username}</span>
                                <Badge className={getPlatformColor(mention.platform)}>{mention.platform}</Badge>
                                <Badge className={getSentimentColor(mention.sentiment)}>{mention.sentiment}</Badge>
                                <span className="text-xs text-gray-500">{formatTimeAgo(mention.timestamp)}</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">{mention.content}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">{formatNumber(mention.followers)} followers</span>
                                {mention.isReplied ? (
                                  <Badge variant="outline" className="text-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Replied
                                  </Badge>
                                ) : (
                                  <Button size="sm" variant="outline">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Reply
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Mention Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Positive</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-24 h-2" />
                        <span className="text-sm font-medium text-green-600">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Neutral</span>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="w-24 h-2" />
                        <span className="text-sm font-medium text-gray-600">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Negative</span>
                      <div className="flex items-center gap-2">
                        <Progress value={10} className="w-24 h-2" />
                        <span className="text-sm font-medium text-red-600">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Response Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-violet-600 mb-2">78%</div>
                      <p className="text-sm text-gray-500">Avg response time: 2.5 hours</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Engagement Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Engagement chart visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Reach & Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Reach trends visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.filter(p => p.status === 'published').sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5).map((post, i) => (
                    <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-1">{post.content}</p>
                        <div className="flex gap-2 mt-1">
                          {post.platforms.slice(0, 3).map(p => (
                            <Badge key={p} className={getPlatformColor(p)} variant="outline">{p}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{post.engagementRate}%</p>
                        <p className="text-xs text-gray-500">{formatNumber(post.reach)} reach</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Campaigns</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map(campaign => (
                <Card key={campaign.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h4>
                        <p className="text-sm text-gray-500">{campaign.description}</p>
                      </div>
                      <Badge className={getCampaignStatusColor(campaign.status)}>{campaign.status}</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Budget</span>
                          <span className="font-medium">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                        </div>
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <p className="text-lg font-bold">{campaign.posts}</p>
                        <p className="text-xs text-gray-500">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{formatNumber(campaign.reach)}</p>
                        <p className="text-xs text-gray-500">Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{formatNumber(campaign.engagement)}</p>
                        <p className="text-xs text-gray-500">Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{campaign.conversions}</p>
                        <p className="text-xs text-gray-500">Conversions</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(account => (
                <Card key={account.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAccount(account)}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={getPlatformColor(account.platform)}>{account.platform[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{account.displayName}</h4>
                          {account.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-500">{account.username}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(account.followers)}</p>
                        <p className="text-xs text-gray-500">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{account.posts}</p>
                        <p className="text-xs text-gray-500">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{account.engagementRate}%</p>
                        <p className="text-xs text-gray-500">Eng. Rate</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={account.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {account.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      <span className="text-xs text-gray-500">Synced {formatTimeAgo(account.lastSync)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-0 shadow-sm border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Connect Account</p>
                  <p className="text-sm text-gray-500">Add a new social media account</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Hootsuite Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-1">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</h3>
                {[
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'publishing', label: 'Publishing', icon: Send },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'integrations', label: 'Integrations', icon: Link2 },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'advanced', label: 'Advanced', icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      settingsTab === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Settings</CardTitle>
                        <CardDescription>General social media management settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Organization Name</Label>
                            <Input defaultValue="Acme Corp" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Timezone</Label>
                            <Select defaultValue="pst">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                                <SelectItem value="est">Eastern Time (EST)</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Connected Accounts</p>
                            <p className="text-2xl font-bold">8</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Posts This Month</p>
                            <p className="text-2xl font-bold">156</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Reach</p>
                            <p className="text-2xl font-bold">1.2M</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Team Settings</CardTitle>
                        <CardDescription>Manage team access and permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">5</p>
                            <p className="text-sm text-gray-500">Admins</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">12</p>
                            <p className="text-sm text-gray-500">Publishers</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-gray-600">8</p>
                            <p className="text-sm text-gray-500">Analysts</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Approval</p>
                            <p className="text-sm text-gray-500">Posts need admin approval</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Invite Team Member
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Content Library</CardTitle>
                        <CardDescription>Manage media assets</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Images</p>
                            <p className="text-xl font-bold">2,450</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Videos</p>
                            <p className="text-xl font-bold">128</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-organize</p>
                            <p className="text-sm text-gray-500">AI-powered organization</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Publishing Settings */}
                {settingsTab === 'publishing' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Scheduling Preferences</CardTitle>
                        <CardDescription>Configure post scheduling</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-Schedule</p>
                            <p className="text-sm text-gray-500">Optimize posting times</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Default Posting Time</Label>
                          <Select defaultValue="best">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="best">Best Time (AI)</SelectItem>
                              <SelectItem value="morning">Morning (9 AM)</SelectItem>
                              <SelectItem value="noon">Noon (12 PM)</SelectItem>
                              <SelectItem value="evening">Evening (6 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Queue Mode</p>
                            <p className="text-sm text-gray-500">Add to queue instead of direct publish</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Posts Per Day Limit</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 posts/day</SelectItem>
                              <SelectItem value="5">5 posts/day</SelectItem>
                              <SelectItem value="10">10 posts/day</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Content Guidelines</CardTitle>
                        <CardDescription>Set posting rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Link Shortening</p>
                            <p className="text-sm text-gray-500">Auto-shorten URLs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">UTM Parameters</p>
                            <p className="text-sm text-gray-500">Auto-add tracking codes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Hashtag Suggestions</p>
                            <p className="text-sm text-gray-500">AI-powered hashtags</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Max Hashtags</Label>
                          <Select defaultValue="10">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 hashtags</SelectItem>
                              <SelectItem value="10">10 hashtags</SelectItem>
                              <SelectItem value="20">20 hashtags</SelectItem>
                              <SelectItem value="30">30 hashtags</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Approval Workflow</CardTitle>
                        <CardDescription>Configure content approval</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Approval</p>
                            <p className="text-sm text-gray-500">Require approval before publishing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Approvers</Label>
                          <Select defaultValue="admins">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins Only</SelectItem>
                              <SelectItem value="managers">Managers</SelectItem>
                              <SelectItem value="any">Any Team Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-approve</p>
                            <p className="text-sm text-gray-500">For trusted publishers</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Analytics Settings */}
                {settingsTab === 'analytics' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Analytics Dashboard</CardTitle>
                        <CardDescription>Configure analytics display</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Date Range</Label>
                          <Select defaultValue="30">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">Last 7 days</SelectItem>
                              <SelectItem value="30">Last 30 days</SelectItem>
                              <SelectItem value="90">Last 90 days</SelectItem>
                              <SelectItem value="365">Last year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Real-time Updates</p>
                            <p className="text-sm text-gray-500">Live analytics data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Compare Periods</p>
                            <p className="text-sm text-gray-500">Show comparison metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Metrics & KPIs</CardTitle>
                        <CardDescription>Choose tracked metrics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Engagement Rate', 'Reach', 'Impressions', 'Clicks', 'Conversions', 'Follower Growth'].map((metric) => (
                          <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="font-medium">{metric}</span>
                            <Switch defaultChecked />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Reports</CardTitle>
                        <CardDescription>Automated reporting settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Send every Monday</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Monthly Reports</p>
                            <p className="text-sm text-gray-500">Send on 1st of month</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Report Format</Label>
                          <Select defaultValue="pdf">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="xlsx">Excel</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Platforms</CardTitle>
                        <CardDescription>Connected social networks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Instagram', connected: true, accounts: 3 },
                          { name: 'Twitter/X', connected: true, accounts: 2 },
                          { name: 'LinkedIn', connected: true, accounts: 1 },
                          { name: 'Facebook', connected: true, accounts: 2 },
                          { name: 'TikTok', connected: false, accounts: 0 },
                          { name: 'YouTube', connected: false, accounts: 0 },
                        ].map((platform) => (
                          <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-5 h-5" />
                              <div>
                                <span className="font-medium">{platform.name}</span>
                                {platform.connected && (
                                  <p className="text-xs text-gray-500">{platform.accounts} accounts</p>
                                )}
                              </div>
                            </div>
                            <Badge className={platform.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {platform.connected ? 'Connected' : 'Connect'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Third-Party Tools</CardTitle>
                        <CardDescription>External integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Canva', status: 'connected' },
                          { name: 'Google Analytics', status: 'connected' },
                          { name: 'Slack', status: 'available' },
                          { name: 'Shopify', status: 'available' },
                        ].map((tool) => (
                          <div key={tool.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="font-medium">{tool.name}</span>
                            <Badge className={tool.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {tool.status === 'connected' ? 'Connected' : 'Connect'}
                            </Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          Browse Integrations
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Developer API settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">API Key</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            sm_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Key
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Post Published</p>
                            <p className="text-sm text-gray-500">When posts go live</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Pending Approval</p>
                            <p className="text-sm text-gray-500">Posts awaiting review</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Performance Alerts</p>
                            <p className="text-sm text-gray-500">Viral content notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Mentions & Comments</p>
                            <p className="text-sm text-gray-500">Engagement alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Push Notifications</CardTitle>
                        <CardDescription>Mobile and desktop alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Desktop Notifications</p>
                            <p className="text-sm text-gray-500">Browser alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Mobile Push</p>
                            <p className="text-sm text-gray-500">App notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Quiet Hours</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <Select defaultValue="22">
                              <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}:00</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select defaultValue="8">
                              <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}:00</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Slack Integration</CardTitle>
                        <CardDescription>Team notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Post Updates</p>
                            <p className="text-sm text-gray-500">Send to #social channel</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Daily Digest</p>
                            <p className="text-sm text-gray-500">Summary at end of day</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data & Privacy</CardTitle>
                        <CardDescription>Data management settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Data Retention</p>
                            <p className="text-sm text-gray-500">Keep analytics history</p>
                          </div>
                          <Select defaultValue="1year">
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6months">6 months</SelectItem>
                              <SelectItem value="1year">1 year</SelectItem>
                              <SelectItem value="2years">2 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Upload className="w-5 h-5" />
                            <span>Import Data</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>AI & Automation</CardTitle>
                        <CardDescription>AI-powered features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">AI Content Suggestions</p>
                            <p className="text-sm text-gray-500">Generate post ideas</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-respond</p>
                            <p className="text-sm text-gray-500">AI replies to comments</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sentiment Analysis</p>
                            <p className="text-sm text-gray-500">Analyze comment sentiment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Trend Detection</p>
                            <p className="text-sm text-gray-500">Alert on trending topics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Drafts</p>
                              <p className="text-sm text-red-600">Remove all draft posts</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Disconnect All Accounts</p>
                              <p className="text-sm text-red-600">Remove all connected platforms</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Disconnect
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Reset Analytics</p>
                              <p className="text-sm text-red-600">Clear all analytics data</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Reset
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Post Detail Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Post Details
              </DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <ScrollArea className="max-h-96">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(selectedPost.status)}>
                      {getStatusIcon(selectedPost.status)}
                      <span className="ml-1">{selectedPost.status}</span>
                    </Badge>
                    {selectedPost.platforms.map(p => (
                      <Badge key={p} className={getPlatformColor(p)}>{p}</Badge>
                    ))}
                  </div>

                  <p className="text-gray-900 dark:text-white">{selectedPost.content}</p>

                  {selectedPost.status === 'published' && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatNumber(selectedPost.likes)}</p>
                        <p className="text-sm text-gray-500">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatNumber(selectedPost.comments)}</p>
                        <p className="text-sm text-gray-500">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatNumber(selectedPost.shares)}</p>
                        <p className="text-sm text-gray-500">Shares</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatNumber(selectedPost.views)}</p>
                        <p className="text-sm text-gray-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatNumber(selectedPost.reach)}</p>
                        <p className="text-sm text-gray-500">Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedPost.engagementRate}%</p>
                        <p className="text-sm text-gray-500">Rate</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Hashtags:</span>
                    {selectedPost.hashtags.map(tag => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
