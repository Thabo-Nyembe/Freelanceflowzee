"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  RankingList,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
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
  FileText
} from 'lucide-react'
import { useSocialPosts, useSocialAccounts, SocialPost, SocialAccount } from '@/lib/hooks/use-social-media'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SocialMediaClientProps {
  initialPosts: SocialPost[]
  initialAccounts: SocialAccount[]
}

export default function SocialMediaClient({ initialPosts, initialAccounts }: SocialMediaClientProps) {
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'scheduled' | 'trending'>('all')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    content_type: 'text',
    platforms: [] as string[],
    hashtags: [] as string[],
    hashtagInput: ''
  })

  const {
    posts,
    loading: postsLoading,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    getStats
  } = useSocialPosts()
  const { accounts, getTotalFollowers } = useSocialAccounts()

  const displayPosts = posts.length > 0 ? posts : initialPosts
  const displayAccounts = accounts.length > 0 ? accounts : initialAccounts
  const stats = getStats()

  const totalFollowers = displayAccounts.reduce((sum, a) => sum + a.followers_count, 0)
  const totalEngagement = displayPosts.filter(p => p.status === 'published')
    .reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0)

  const statCards = [
    { label: 'Total Posts', value: displayPosts.length.toLocaleString(), change: 18.5, icon: <Share2 className="w-5 h-5" /> },
    { label: 'Total Engagement', value: totalEngagement > 1000 ? `${(totalEngagement / 1000).toFixed(0)}K` : totalEngagement.toString(), change: 24.3, icon: <Heart className="w-5 h-5" /> },
    { label: 'Avg Engagement', value: `${stats.avgEngagementRate.toFixed(1)}%`, change: 5.7, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Total Followers', value: totalFollowers > 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers.toString(), change: 12.8, icon: <Users className="w-5 h-5" /> }
  ]

  const topPosts = displayPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      name: p.content.substring(0, 30) + '...',
      avatar: p.content_type === 'video' ? '🎬' : p.content_type === 'image' ? '📸' : '📝',
      value: `${(p.views / 1000).toFixed(1)}K views`,
      change: p.engagement_rate
    }))

  const recentActivity = displayPosts
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map(p => ({
      icon: p.status === 'published' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />,
      title: p.status === 'published' ? 'Post published' : p.status === 'scheduled' ? 'Post scheduled' : 'Post created',
      description: p.content.substring(0, 40) + '...',
      time: new Date(p.updated_at).toLocaleDateString(),
      status: p.status === 'published' ? 'success' as const : 'info' as const
    }))

  const filteredPosts = displayPosts.filter(post => {
    if (viewMode === 'all') return true
    if (viewMode === 'published') return post.status === 'published'
    if (viewMode === 'scheduled') return post.status === 'scheduled'
    if (viewMode === 'trending') return post.is_trending || post.engagement_rate > 8
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': case 'reel': return <Video className="w-4 h-4" />
      case 'image': case 'carousel': return <Image className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700'
      case 'image': return 'bg-purple-100 text-purple-700'
      case 'reel': return 'bg-orange-100 text-orange-700'
      case 'carousel': return 'bg-indigo-100 text-indigo-700'
      case 'story': return 'bg-pink-100 text-pink-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const platforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube']

  const togglePlatform = (platform: string) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleCreatePost = async () => {
    if (!newPost.content || newPost.platforms.length === 0) return
    try {
      await createPost({
        content: newPost.content,
        content_type: newPost.content_type as any,
        platforms: newPost.platforms,
        hashtags: newPost.hashtags
      })
      setShowNewPost(false)
      setNewPost({ content: '', content_type: 'text', platforms: [], hashtags: [], hashtagInput: '' })
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Share2 className="w-10 h-10 text-violet-600" />
              Social Media
            </h1>
            <p className="text-muted-foreground">Manage posts across all social platforms</p>
          </div>
          <GradientButton from="violet" to="fuchsia" onClick={() => setShowNewPost(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statCards} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Create Post" description="New content" onClick={() => setShowNewPost(true)} />
          <BentoQuickAction icon={<Clock />} title="Schedule" description={`${stats.scheduledPosts} pending`} onClick={() => setViewMode('scheduled')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => {}} />
          <BentoQuickAction icon={<Users />} title="Accounts" description={`${displayAccounts.length} connected`} onClick={() => {}} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={viewMode === 'all' ? 'primary' : 'ghost'} onClick={() => setViewMode('all')}>
            All Posts
          </PillButton>
          <PillButton variant={viewMode === 'published' ? 'primary' : 'ghost'} onClick={() => setViewMode('published')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Published
          </PillButton>
          <PillButton variant={viewMode === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setViewMode('scheduled')}>
            <Clock className="w-4 h-4 mr-2" />
            Scheduled
          </PillButton>
          <PillButton variant={viewMode === 'trending' ? 'primary' : 'ghost'} onClick={() => setViewMode('trending')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {viewMode === 'all' && 'All Posts'}
                  {viewMode === 'published' && 'Published Posts'}
                  {viewMode === 'scheduled' && 'Scheduled Posts'}
                  {viewMode === 'trending' && 'Trending Posts'}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredPosts.length})
                  </span>
                </h3>
                {postsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>

              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Share2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No posts yet. Create your first post!</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="p-4 rounded-xl border border-border bg-background hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${getStatusColor(post.status)}`}>
                              {post.status === 'published' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {post.status}
                            </span>
                            <span className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${getContentTypeColor(post.content_type)}`}>
                              {getContentTypeIcon(post.content_type)}
                              {post.content_type}
                            </span>
                            {post.is_trending && (
                              <span className="px-2 py-1 rounded-md text-xs bg-orange-100 text-orange-700">
                                Trending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 mb-2 line-clamp-2">{post.content}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.platforms.map((platform) => (
                              <span key={platform} className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-700">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {post.status === 'published' && (
                        <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Likes</p>
                            <p className="font-semibold">{formatNumber(post.likes)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Comments</p>
                            <p className="font-semibold">{formatNumber(post.comments)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Shares</p>
                            <p className="font-semibold">{formatNumber(post.shares)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Views</p>
                            <p className="font-semibold">{formatNumber(post.views)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t">
                        {post.status === 'draft' && (
                          <>
                            <ModernButton variant="outline" size="sm" onClick={() => publishPost(post.id)}>
                              <Send className="w-3 h-3 mr-1" />
                              Publish
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => schedulePost(post.id, new Date(Date.now() + 86400000).toISOString())}>
                              <Clock className="w-3 h-3 mr-1" />
                              Schedule
                            </ModernButton>
                          </>
                        )}
                        {post.status === 'scheduled' && (
                          <ModernButton variant="outline" size="sm" onClick={() => publishPost(post.id)}>
                            <Send className="w-3 h-3 mr-1" />
                            Publish Now
                          </ModernButton>
                        )}
                        {post.status === 'published' && (
                          <ModernButton variant="outline" size="sm" onClick={() => {}}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                        )}
                        <ModernButton variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </ModernButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Performing" items={topPosts.length > 0 ? topPosts : [
              { rank: 1, name: 'Create your first post!', avatar: '📝', value: '-', change: 0 }
            ]} />

            <ActivityFeed title="Recent Activity" activities={recentActivity.length > 0 ? recentActivity : [
              { icon: <Plus className="w-5 h-5" />, title: 'Get started', description: 'Create your first post', time: 'Now', status: 'info' as const }
            ]} />

            <ProgressCard
              title="Monthly Goal"
              current={stats.publishedPosts}
              goal={300}
              unit=""
              icon={<Share2 className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Reach" value={`${(stats.totalReach / Math.max(stats.publishedPosts, 1) / 1000).toFixed(1)}K`} change={15.7} />
                <MiniKPI label="Engagement Rate" value={`${stats.avgEngagementRate.toFixed(1)}%`} change={5.7} />
                <MiniKPI label="Total Impressions" value={`${(stats.totalImpressions / 1000).toFixed(0)}K`} change={22.3} />
                <MiniKPI label="Trending Posts" value={stats.trendingPosts.toString()} change={8.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>
              Create a new post to share across your social platforms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your mind?"
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="type">Content Type</Label>
              <Select value={newPost.content_type} onValueChange={(v) => setNewPost({ ...newPost, content_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                      newPost.platforms.includes(platform)
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowNewPost(false)}>
              Cancel
            </ModernButton>
            <GradientButton from="violet" to="fuchsia" onClick={handleCreatePost}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
