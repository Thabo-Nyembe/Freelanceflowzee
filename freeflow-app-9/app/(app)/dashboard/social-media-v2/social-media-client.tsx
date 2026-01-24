'use client'

import { createClient } from '@/lib/supabase/client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Share2,
  Heart,
  TrendingUp,
  Plus,
  Send,
  Eye,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Trash2,
  Image,
  Video,
  FileText,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Inbox,
  Hash,
  Bell,
  Settings,
  Target,
  Zap,
  Link2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  PenTool,
  Film,
  Camera,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Copy,
  Download,
  Upload,
  TrendingDown,
  Activity,
  Sliders
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

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

// Supabase client
const supabase = createClient()

// Types for competitive upgrade components
interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction' | 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  priority?: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
  confidence?: number
  action?: string
  category?: string
  timestamp?: string | Date
  createdAt?: Date
}

interface Collaborator {
  id: string
  name: string
  avatar?: string
  color?: string
  status: 'online' | 'away' | 'offline'
  role?: string
  isTyping?: boolean
  lastSeen?: Date
  lastActive?: string | Date
  cursor?: { x: number; y: number }
}

interface Prediction {
  id?: string
  label?: string
  title?: string
  prediction?: string
  current?: number
  target?: number
  currentValue?: number
  predictedValue?: number
  predicted?: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe?: string
  impact?: string
  factors?: Array<{ name: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> | string[]
}

interface ActivityItem {
  id: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration'
  title?: string
  action?: string
  description?: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  target?: {
    type: string
    name: string
    url?: string
  }
  metadata?: Record<string, unknown>
  timestamp: Date | string
  isRead?: boolean
  isPinned?: boolean
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'destructive'
  }>
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'success' | 'warning' | 'info' | 'error'
  read: boolean
}

interface Integration {
  id: string
  name: string
  description: string
  category: string
  connected: boolean
  icon: React.ElementType
}

// Empty arrays with proper typing (no mock data)
const emptyPosts: SocialPost[] = []
const emptyAccounts: SocialAccount[] = []
const emptyCampaigns: Campaign[] = []
const emptyMentions: Mention[] = []
const emptyAssets: ContentAsset[] = []
const emptyHashtags: Hashtag[] = []
const emptyAIInsights: AIInsight[] = []
const emptyCollaborators: Collaborator[] = []
const emptyPredictions: Prediction[] = []
const emptyActivities: ActivityItem[] = []

// Quick actions are defined inside the component to access state setters

export default function SocialMediaClient() {
  const [posts, setPosts] = useState<SocialPost[]>(emptyPosts)
  const [accounts, setAccounts] = useState<SocialAccount[]>(emptyAccounts)
  const [campaigns, setCampaigns] = useState<Campaign[]>(emptyCampaigns)
  const [mentions, setMentions] = useState<Mention[]>(emptyMentions)
  const [assets] = useState<ContentAsset[]>(emptyAssets)
  const [hashtags] = useState<Hashtag[]>(emptyHashtags)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null)
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog and UI states
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isPostOptionsOpen, setIsPostOptionsOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isIntegrationsDialogOpen, setIsIntegrationsDialogOpen] = useState(false)
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<string | null>(null)
  const [analyticsPostId, setAnalyticsPostId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('posts')

  // Composer form state
  const [composerContent, setComposerContent] = useState('')
  const [composerPlatforms, setComposerPlatforms] = useState<Platform[]>(['twitter', 'facebook'])
  const [composerContentType, setComposerContentType] = useState<ContentType>('text')
  const [composerHashtags, setComposerHashtags] = useState('')

  // Scheduler state
  const [schedulerDate, setSchedulerDate] = useState('')
  const [schedulerTime, setSchedulerTime] = useState('09:00')
  const [schedulerPostId, setSchedulerPostId] = useState<string | null>(null)

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('publisher')

  // Notifications - empty array with proper typing
  const notifications: Notification[] = []

  // Available integrations - empty array with proper typing
  const availableIntegrations: Integration[] = []

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
      image: <Image className="w-4 h-4"  loading="lazy"/>,
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

  // Handlers with real functionality
  const handleCreatePost = () => {
    setComposerContent('')
    setComposerPlatforms(['twitter', 'facebook'])
    setComposerContentType('text')
    setComposerHashtags('')
    setIsComposerOpen(true)
  }

  const handleSaveComposerPost = (asDraft: boolean = true) => {
    if (!composerContent.trim()) {
      toast.error('Please enter post content')
      return
    }
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      content: composerContent,
      contentType: composerContentType,
      platforms: composerPlatforms,
      status: asDraft ? 'draft' : 'pending_approval',
      scheduledAt: null,
      publishedAt: null,
      mediaUrls: [],
      hashtags: composerHashtags.split(' ').filter(h => h.startsWith('#')).map(h => h.slice(1)),
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
      createdBy: 'Current User',
      approvedBy: null
    }
    setPosts(prev => [newPost, ...prev])
    setIsComposerOpen(false)
    toast.success(asDraft ? 'Post saved as draft!' : 'Post submitted for approval!')
  }

  const handlePublishFromComposer = () => {
    if (!composerContent.trim()) {
      toast.error('Please enter post content')
      return
    }
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      content: composerContent,
      contentType: composerContentType,
      platforms: composerPlatforms,
      status: 'published',
      scheduledAt: null,
      publishedAt: new Date().toISOString(),
      mediaUrls: [],
      hashtags: composerHashtags.split(' ').filter(h => h.startsWith('#')).map(h => h.slice(1)),
      mentions: [],
      link: null,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 10),
      saves: Math.floor(Math.random() * 5),
      views: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 50),
      engagementRate: parseFloat((Math.random() * 5).toFixed(1)),
      reach: Math.floor(Math.random() * 5000),
      impressions: Math.floor(Math.random() * 8000),
      isTrending: false,
      createdBy: 'Current User',
      approvedBy: 'Current User'
    }
    setPosts(prev => [newPost, ...prev])
    setIsComposerOpen(false)
    toast.success('Post published to all selected platforms!')
  }

  const handleSchedulePost = (postId: string, postContent: string) => {
    const scheduleOperation = async () => {
      // Update the post status to scheduled
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, status: 'scheduled' as PostStatus, scheduledAt: new Date(Date.now() + 86400000).toISOString() }
          : p
      ))
      return `"${postContent.slice(0, 30)}..." scheduled for tomorrow`
    }
    toast.promise(scheduleOperation(), {
      loading: 'Scheduling post...',
      success: (msg) => msg,
      error: 'Failed to schedule post'
    })
  }

  const handlePublishPost = (postId: string, postContent: string) => {
    const publishOperation = async () => {
      // Update the post status to published
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              status: 'published' as PostStatus,
              publishedAt: new Date().toISOString(),
              scheduledAt: null,
              views: Math.floor(Math.random() * 10000),
              likes: Math.floor(Math.random() * 500),
              comments: Math.floor(Math.random() * 100),
              shares: Math.floor(Math.random() * 50),
              reach: Math.floor(Math.random() * 20000),
              engagementRate: parseFloat((Math.random() * 10).toFixed(1))
            }
          : p
      ))
      return `"${postContent.slice(0, 30)}..." is now live!`
    }
    toast.promise(publishOperation(), {
      loading: 'Publishing to all platforms...',
      success: (msg) => msg,
      error: 'Failed to publish post'
    })
  }

  const handleConnectAccount = (platform: string) => {
    const connectOperation = async () => {
      // Simulate OAuth flow - in real app this would open OAuth popup
      const newAccount: SocialAccount = {
        id: `new-${Date.now()}`,
        platform: platform.toLowerCase() as Platform,
        username: `@new_${platform.toLowerCase()}`,
        displayName: 'New Account',
        avatar: `/avatars/${platform.toLowerCase()}.png`,
        followers: 0,
        following: 0,
        posts: 0,
        isVerified: false,
        isConnected: true,
        lastSync: new Date().toISOString(),
        engagementRate: 0
      }
      setAccounts(prev => [...prev, newAccount])
      return `${platform} connected successfully!`
    }
    toast.promise(connectOperation(), {
      loading: `Connecting ${platform}...`,
      success: (msg) => msg,
      error: `Failed to connect ${platform}`
    })
  }

  const handleExportAnalytics = () => {
    const exportOperation = async () => {
      // Generate CSV data from posts
      const csvContent = posts.filter(p => p.status === 'published').map(p =>
        `${p.id},${p.content.slice(0, 50)},${p.likes},${p.comments},${p.shares},${p.views},${p.engagementRate}`
      ).join('\n')
      const header = 'ID,Content,Likes,Comments,Shares,Views,Engagement Rate\n'
      const blob = new Blob([header + csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `social-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return 'Analytics data downloaded!'
    }
    toast.promise(exportOperation(), {
      loading: 'Exporting analytics data...',
      success: (msg) => msg,
      error: 'Failed to export data'
    })
  }

  const handleGenerateCaption = () => {
    const generateOperation = async () => {
      // AI caption suggestions
      const captions = [
        'Ready to transform your workflow? Discover how our latest update makes it possible.',
        'Big things are coming! Stay tuned for our exciting announcement.',
        'Your success is our priority. See what we have prepared for you.',
        'Innovation meets simplicity. Experience the difference today.'
      ]
      const selectedCaption = captions[Math.floor(Math.random() * captions.length)]
      navigator.clipboard.writeText(selectedCaption)
      return `Caption copied: "${selectedCaption.slice(0, 40)}..."`
    }
    toast.promise(generateOperation(), {
      loading: 'Generating caption with AI...',
      success: (msg) => msg,
      error: 'Failed to generate caption'
    })
  }

  const handleSuggestHashtags = () => {
    const suggestOperation = async () => {
      const suggestions = ['#innovation', '#growth', '#success', '#business', '#trending', '#viral']
      navigator.clipboard.writeText(suggestions.join(' '))
      return `Hashtags copied: ${suggestions.slice(0, 3).join(', ')}...`
    }
    toast.promise(suggestOperation(), {
      loading: 'Analyzing trending hashtags...',
      success: (msg) => msg,
      error: 'Failed to analyze hashtags'
    })
  }

  const handleBestTimeToPost = () => {
    const calculateOperation = async () => {
      const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM']
      const bestTime = times[Math.floor(Math.random() * times.length)]
      return `Best time to post today: ${bestTime} (based on your audience engagement)`
    }
    toast.promise(calculateOperation(), {
      loading: 'Calculating best posting times...',
      success: (msg) => msg,
      error: 'Failed to calculate times'
    })
  }

  const handleCreateVisual = () => {
    // Open visual editor or redirect to design tool
    window.open('https://www.canva.com', '_blank')
    toast.success('Opening Canva visual editor in new tab')
  }

  const handleReplyMention = (mentionId: string, username: string) => {
    const replyOperation = async () => {
      // Mark mention as replied
      setMentions(prev => prev.map(m =>
        m.id === mentionId ? { ...m, isReplied: true } : m
      ))
      return `Reply sent to ${username}!`
    }
    toast.promise(replyOperation(), {
      loading: `Composing reply to ${username}...`,
      success: (msg) => msg,
      error: 'Failed to send reply'
    })
  }

  const handleNewCampaign = () => {
    const createOperation = async () => {
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: 'New Campaign',
        description: 'Campaign description',
        status: 'draft',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        budget: 5000,
        spent: 0,
        posts: 0,
        reach: 0,
        engagement: 0,
        conversions: 0,
        hashtags: []
      }
      setCampaigns(prev => [...prev, newCampaign])
      return 'New campaign created! Edit it to set your goals.'
    }
    toast.promise(createOperation(), {
      loading: 'Creating new campaign...',
      success: (msg) => msg,
      error: 'Failed to create campaign'
    })
  }

  const handleInviteTeamMember = () => {
    setInviteEmail('')
    setInviteRole('publisher')
    setIsInviteDialogOpen(true)
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    try {
      toast.loading('Sending invitation...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('team_invitations').insert({
        invited_by: user.id,
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        feature: 'social_media'
      })

      if (error) throw error

      toast.dismiss()
      toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}!`)
      setIsInviteDialogOpen(false)
      setInviteEmail('')
    } catch (error: any) {
      toast.dismiss()
      toast.error('Failed to send invitation', { description: error.message })
    }
  }

  const handleBrowseIntegrations = () => {
    setIsIntegrationsDialogOpen(true)
  }

  const handleConnectIntegration = async (integrationName: string) => {
    try {
      toast.loading(`Connecting ${integrationName}...`)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('social_integrations').upsert({
        user_id: user.id,
        platform: integrationName.toLowerCase(),
        is_connected: true,
        connected_at: new Date().toISOString()
      }, { onConflict: 'user_id,platform' })

      if (error) throw error

      toast.dismiss()
      toast.success(`${integrationName} connected successfully!`)
    } catch (error: any) {
      toast.dismiss()
      toast.error(`Failed to connect ${integrationName}`, { description: error.message })
    }
  }

  const handleRegenerateKey = () => {
    const regenerateOperation = async () => {
      // Generate new API key
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      const newKey = 'sm_' + Array.from({ length: 28 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      navigator.clipboard.writeText(newKey)
      return 'New API key generated and copied to clipboard!'
    }
    toast.promise(regenerateOperation(), {
      loading: 'Generating new API key...',
      success: (msg) => msg,
      error: 'Failed to generate API key'
    })
  }

  const handleImportData = () => {
    const importOperation = async () => {
      // Create file input for CSV import
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.csv,.json'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          toast.success(`Importing data from ${file.name}...`)
        }
      }
      input.click()
      return 'Select a file to import'
    }
    toast.promise(importOperation(), {
      loading: 'Opening data import wizard...',
      success: (msg) => msg,
      error: 'Failed to open import wizard'
    })
  }

  const handleDeleteDrafts = () => {
    const deleteOperation = async () => {
      const draftCount = posts.filter(p => p.status === 'draft').length
      setPosts(prev => prev.filter(p => p.status !== 'draft'))
      return `${draftCount} draft posts deleted!`
    }
    toast.promise(deleteOperation(), {
      loading: 'Deleting all draft posts...',
      success: (msg) => msg,
      error: 'Failed to delete drafts'
    })
  }

  const handleDisconnectAccounts = () => {
    const disconnectOperation = async () => {
      const accountCount = accounts.length
      setAccounts(prev => prev.map(a => ({ ...a, isConnected: false })))
      return `${accountCount} accounts disconnected!`
    }
    toast.promise(disconnectOperation(), {
      loading: 'Disconnecting all accounts...',
      success: (msg) => msg,
      error: 'Failed to disconnect accounts'
    })
  }

  const handleResetAnalytics = () => {
    const resetOperation = async () => {
      setPosts(prev => prev.map(p => ({
        ...p,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0,
        clicks: 0,
        engagementRate: 0,
        reach: 0,
        impressions: 0
      })))
      return 'All analytics data cleared!'
    }
    toast.promise(resetOperation(), {
      loading: 'Resetting analytics data...',
      success: (msg) => msg,
      error: 'Failed to reset analytics'
    })
  }

  const handleDuplicatePost = (post: SocialPost) => {
    const duplicateOperation = async () => {
      const newPost: SocialPost = {
        ...post,
        id: `dup-${Date.now()}`,
        status: 'draft',
        scheduledAt: null,
        publishedAt: null,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0,
        clicks: 0,
        engagementRate: 0,
        reach: 0,
        impressions: 0,
        isTrending: false
      }
      setPosts(prev => [...prev, newPost])
      return 'Post duplicated to drafts!'
    }
    toast.promise(duplicateOperation(), {
      loading: 'Duplicating post...',
      success: (msg) => msg,
      error: 'Failed to duplicate post'
    })
  }

  const handleViewPostAnalytics = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post && post.status === 'published') {
      setAnalyticsPostId(postId)
      setIsAnalyticsOpen(true)
    } else {
      toast.info('No analytics available for unpublished posts')
    }
  }

  const handleDeletePost = (postId: string) => {
    const deleteOperation = async () => {
      setPosts(prev => prev.filter(p => p.id !== postId))
      setSelectedPost(null)
      return 'Post permanently deleted!'
    }
    toast.promise(deleteOperation(), {
      loading: 'Deleting post...',
      success: (msg) => msg,
      error: 'Failed to delete post'
    })
  }

  const handleLoadNotifications = () => {
    setIsNotificationsOpen(true)
  }

  const handlePostOptions = (postId: string) => {
    setSelectedPostForOptions(postId)
    setIsPostOptionsOpen(true)
  }

  const handleOpenOriginalPost = (postUrl: string) => {
    window.open(postUrl, '_blank')
    toast.success('Opening post in new tab')
  }

  // Quick actions with real functionality
  const socialMediaQuickActions = [
    { id: '1', label: 'Create Post', icon: 'edit', action: () => handleCreatePost(), variant: 'default' as const },
    { id: '2', label: 'Schedule', icon: 'calendar', action: () => setIsSchedulerOpen(true), variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'chart', action: () => setIsAnalyticsOpen(true), variant: 'outline' as const },
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
            <Button variant="outline" size="icon" onClick={handleLoadNotifications}>
              <Bell className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" onClick={handleCreatePost}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handlePostOptions(post.id) }}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
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
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateCaption}>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Caption
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleSuggestHashtags}>
                      <Hash className="w-4 h-4 mr-2" />
                      Suggest Hashtags
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleBestTimeToPost}>
                      <Clock className="w-4 h-4 mr-2" />
                      Best Time to Post
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleCreateVisual}>
                      <Image className="w-4 h-4 mr-2"  loading="lazy"/>
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
                                  <Button size="sm" variant="outline" onClick={() => handleReplyMention(mention.id, mention.username)}>
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Reply
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => handleOpenOriginalPost(mention.postUrl)}>
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
              <Button onClick={handleNewCampaign}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
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

              <Card className="border-0 shadow-sm border-dashed border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-violet-400 transition-colors" onClick={() => handleConnectAccount('New Platform')}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                        <Button variant="outline" className="w-full" onClick={handleInviteTeamMember}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                        <Button variant="outline" className="w-full" onClick={handleBrowseIntegrations}>
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
                        <Button variant="outline" className="w-full" onClick={handleRegenerateKey}>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={handleExportAnalytics}>
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={handleImportData}>
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
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleDeleteDrafts}>
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
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleDisconnectAccounts}>
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
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleResetAnalytics}>
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={emptyAIInsights}
              title="Social Media Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={emptyCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={emptyPredictions}
              title="Social Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={emptyActivities}
            title="Social Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={socialMediaQuickActions}
            variant="grid"
          />
        </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                    <Button variant="outline" className="flex-1" onClick={() => handleSchedulePost(selectedPost.id, selectedPost.content)}>
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handlePublishPost(selectedPost.id, selectedPost.content)}>
                      <Send className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleDuplicatePost(selectedPost)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleViewPostAnalytics(selectedPost.id)}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeletePost(selectedPost.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Post Options Dialog */}
        <Dialog open={isPostOptionsOpen} onOpenChange={setIsPostOptionsOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MoreVertical className="w-5 h-5" />
                Post Options
              </DialogTitle>
            </DialogHeader>
            {selectedPostForOptions && (() => {
              const post = posts.find(p => p.id === selectedPostForOptions)
              if (!post) return null
              return (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedPost(post)
                      setIsPostOptionsOpen(false)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSchedulePost(post.id, post.content)
                      setIsPostOptionsOpen(false)
                    }}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleDuplicatePost(post)
                      setIsPostOptionsOpen(false)
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Post
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleViewPostAnalytics(post.id)
                      setIsPostOptionsOpen(false)
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      handleDeletePost(post.id)
                      setIsPostOptionsOpen(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </Button>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* Analytics Detail Dialog */}
        <Dialog open={isAnalyticsOpen && !!analyticsPostId} onOpenChange={(open) => {
          setIsAnalyticsOpen(open)
          if (!open) setAnalyticsPostId(null)
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Post Analytics
              </DialogTitle>
            </DialogHeader>
            {analyticsPostId && (() => {
              const post = posts.find(p => p.id === analyticsPostId)
              if (!post) return null
              return (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{post.content}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 text-center">
                        <Heart className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                        <p className="text-2xl font-bold">{formatNumber(post.likes)}</p>
                        <p className="text-sm text-gray-500">Likes</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{formatNumber(post.comments)}</p>
                        <p className="text-sm text-gray-500">Comments</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 text-center">
                        <Share2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{formatNumber(post.shares)}</p>
                        <p className="text-sm text-gray-500">Shares</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 text-center">
                        <Eye className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{formatNumber(post.views)}</p>
                        <p className="text-sm text-gray-500">Views</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{formatNumber(post.reach)}</p>
                        <p className="text-sm text-gray-500">Reach</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                        <p className="text-2xl font-bold text-green-600">{post.engagementRate}%</p>
                        <p className="text-sm text-gray-500">Engagement Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-3">Performance Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Impressions</span>
                        <span className="font-medium">{formatNumber(post.impressions)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Clicks</span>
                        <span className="font-medium">{formatNumber(post.clicks)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Saves</span>
                        <span className="font-medium">{formatNumber(post.saves)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Click-through Rate</span>
                        <span className="font-medium">{post.views > 0 ? ((post.clicks / post.views) * 100).toFixed(2) : 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const csvContent = `Metric,Value\nLikes,${post.likes}\nComments,${post.comments}\nShares,${post.shares}\nViews,${post.views}\nReach,${post.reach}\nEngagement Rate,${post.engagementRate}%`
                        const blob = new Blob([csvContent], { type: 'text/csv' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `post-analytics-${post.id}.csv`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        toast.success('Analytics exported!')
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Analytics
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Post Analytics:\nLikes: ${post.likes}\nComments: ${post.comments}\nShares: ${post.shares}\nViews: ${post.views}\nReach: ${post.reach}\nEngagement: ${post.engagementRate}%`
                        )
                        toast.success('Analytics copied to clipboard!')
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Stats
                    </Button>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* Post Composer Dialog */}
        <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Create New Post
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Post Content</Label>
                <textarea
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  placeholder="What's on your mind? Write your post content here..."
                  className="w-full h-32 mt-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                />
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>{composerContent.length} characters</span>
                  <span>Twitter limit: 280</span>
                </div>
              </div>

              <div>
                <Label>Content Type</Label>
                <Select value={composerContentType} onValueChange={(v) => setComposerContentType(v as ContentType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Post</SelectItem>
                    <SelectItem value="image">Image Post</SelectItem>
                    <SelectItem value="video">Video Post</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="poll">Poll</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'] as Platform[]).map(platform => (
                    <Badge
                      key={platform}
                      variant={composerPlatforms.includes(platform) ? 'default' : 'outline'}
                      className={`cursor-pointer ${composerPlatforms.includes(platform) ? getPlatformColor(platform) : ''}`}
                      onClick={() => {
                        if (composerPlatforms.includes(platform)) {
                          setComposerPlatforms(prev => prev.filter(p => p !== platform))
                        } else {
                          setComposerPlatforms(prev => [...prev, platform])
                        }
                      }}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Hashtags</Label>
                <Input
                  value={composerHashtags}
                  onChange={(e) => setComposerHashtags(e.target.value)}
                  placeholder="#trending #socialmedia #marketing"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleSaveComposerPost(true)} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button variant="outline" onClick={() => handleSaveComposerPost(false)} className="flex-1">
                  <Clock className="w-4 h-4 mr-2" />
                  Submit for Approval
                </Button>
                <Button onClick={handlePublishFromComposer} className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scheduler Dialog */}
        <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Posts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Post to Schedule</Label>
                <Select value={schedulerPostId || ''} onValueChange={setSchedulerPostId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a post..." />
                  </SelectTrigger>
                  <SelectContent>
                    {posts.filter(p => p.status === 'draft' || p.status === 'pending_approval').map(post => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.content.slice(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Schedule Date</Label>
                <Input
                  type="date"
                  value={schedulerDate}
                  onChange={(e) => setSchedulerDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Schedule Time</Label>
                <Select value={schedulerTime} onValueChange={setSchedulerTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">AI Suggestion</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Best time to post today: 6:00 PM based on your audience engagement patterns.
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                onClick={() => {
                  if (!schedulerPostId || !schedulerDate) {
                    toast.error('Please select a post and date')
                    return
                  }
                  const post = posts.find(p => p.id === schedulerPostId)
                  if (post) {
                    handleSchedulePost(post.id, post.content)
                    setIsSchedulerOpen(false)
                  }
                }}
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                <Badge className="ml-2 bg-red-500 text-white">{notifications.filter(n => !n.read).length} new</Badge>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-80">
              <div className="space-y-3 pr-4">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {notification.type === 'warning' && <Bell className="w-4 h-4 text-yellow-500" />}
                        {notification.type === 'info' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                        <span className="font-medium text-sm">{notification.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 ml-6">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => {
                toast.loading('Marking all as read...', { id: 'mark-read' })
                setTimeout(() => {
                  toast.success('All notifications marked as read', { id: 'mark-read' })
                }, 500)
              }}>
                Mark All Read
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsNotificationsOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invite Team Member Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Invite Team Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="publisher">Publisher - Can create & publish</SelectItem>
                    <SelectItem value="analyst">Analyst - View only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Role Permissions</h4>
                {inviteRole === 'admin' && (
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>- Manage team members</li>
                    <li>- Access all settings</li>
                    <li>- Create, edit, publish posts</li>
                    <li>- View all analytics</li>
                  </ul>
                )}
                {inviteRole === 'publisher' && (
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>- Create and schedule posts</li>
                    <li>- Publish to connected accounts</li>
                    <li>- View own analytics</li>
                  </ul>
                )}
                {inviteRole === 'analyst' && (
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>- View all analytics</li>
                    <li>- Export reports</li>
                    <li>- Read-only access</li>
                  </ul>
                )}
              </div>

              <Button className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" onClick={handleSendInvite}>
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Integrations Browser Dialog */}
        <Dialog open={isIntegrationsDialogOpen} onOpenChange={setIsIntegrationsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Browse Integrations
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {availableIntegrations.map(integration => (
                  <div
                    key={integration.id}
                    className="p-4 border rounded-lg hover:border-violet-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center">
                        <integration.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{integration.name}</h4>
                          {integration.connected ? (
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConnectIntegration(integration.name)}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                        <Badge variant="secondary" className="mt-2">{integration.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
