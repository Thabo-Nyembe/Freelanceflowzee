"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Users,
  Plus,
  MessageSquare,
  ThumbsUp,
  Share2,
  TrendingUp,
  Award,
  Star,
  Heart,
  Eye
} from 'lucide-react'

/**
 * Community V2 - Groundbreaking Community Engagement
 * Showcases community features with modern components
 */
export default function CommunityV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'trending' | 'new'>('all')

  const stats = [
    { label: 'Members', value: '2,847', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Today', value: '847', change: 25.3, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Posts', value: '1,245', change: 15.2, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Engagement', value: '94%', change: 8.7, icon: <Heart className="w-5 h-5" /> }
  ]

  const posts = [
    {
      id: '1',
      author: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ',
      content: 'Just launched our new product feature! Check it out and let me know what you think. The feedback has been amazing so far!',
      likes: 124,
      comments: 45,
      shares: 12,
      time: '2 hours ago'
    },
    {
      id: '2',
      author: 'Michael Chen',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC',
      content: 'Great discussion in today\'s community call. Looking forward to implementing the suggestions!',
      likes: 89,
      comments: 23,
      shares: 8,
      time: '5 hours ago'
    },
    {
      id: '3',
      author: 'Emily Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER',
      content: 'Anyone interested in a design collaboration? Working on something exciting and would love some creative input.',
      likes: 67,
      comments: 34,
      shares: 5,
      time: '1 day ago'
    }
  ]

  const recentActivity = [
    { icon: <Users className="w-5 h-5" />, title: 'New member joined', description: 'David Kim joined the community', time: '10 minutes ago', status: 'success' as const },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'New discussion', description: 'Product roadmap feedback thread', time: '1 hour ago', status: 'info' as const },
    { icon: <Award className="w-5 h-5" />, title: 'Badge earned', description: 'Sarah Johnson earned Super Contributor', time: '3 hours ago', status: 'success' as const },
    { icon: <Star className="w-5 h-5" />, title: 'Top post', description: 'Feature announcement trending', time: '5 hours ago', status: 'info' as const }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-orange-600" />
              Community
            </h1>
            <p className="text-muted-foreground">Connect, share, and grow together</p>
          </div>
          <GradientButton from="orange" to="amber" onClick={() => console.log('New post')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Post" description="Share update" onClick={() => console.log('Post')} />
          <BentoQuickAction icon={<MessageSquare />} title="Discussions" description="Join" onClick={() => console.log('Discussions')} />
          <BentoQuickAction icon={<Users />} title="Members" description="Browse" onClick={() => console.log('Members')} />
          <BentoQuickAction icon={<Award />} title="Leaderboard" description="Top contributors" onClick={() => console.log('Leaderboard')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>
            All Posts
          </PillButton>
          <PillButton variant={selectedFilter === 'trending' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('trending')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </PillButton>
          <PillButton variant={selectedFilter === 'new' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('new')}>
            New
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <ModernButton variant="outline" size="sm">
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </ModernButton>
                  </div>
                </div>
              </div>
            </BentoCard>

            <div className="space-y-4">
              {posts.map((post) => (
                <BentoCard key={post.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="mb-2">
                        <h4 className="font-semibold">{post.author}</h4>
                        <p className="text-xs text-muted-foreground">{post.time}</p>
                      </div>
                      <p className="text-sm mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                          {post.shares}
                        </button>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=SJ" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">847 points</p>
                  </div>
                  <Award className="w-5 h-5 text-orange-600" />
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=MC" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Michael Chen</p>
                    <p className="text-xs text-muted-foreground">724 points</p>
                  </div>
                  <Star className="w-5 h-5 text-orange-600" />
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=ER" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Emily Rodriguez</p>
                    <p className="text-xs text-muted-foreground">612 points</p>
                  </div>
                  <Heart className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Posts Today" value="124" change={25.3} />
                <MiniKPI label="Active Discussions" value="47" change={15.2} />
                <MiniKPI label="Avg Response Time" value="12min" change={-18.7} />
                <MiniKPI label="Member Growth" value="+12.5%" change={12.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
