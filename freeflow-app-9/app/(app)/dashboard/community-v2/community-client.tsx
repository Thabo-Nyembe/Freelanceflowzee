'use client'

import { useState } from 'react'
import { useCommunity, type Community, type CommunityType, type CommunityStatus } from '@/lib/hooks/use-community'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Users, Plus, MessageSquare, ThumbsUp, Share2, TrendingUp, Award, Star, Heart, Eye } from 'lucide-react'

export default function CommunityClient({ initialCommunities }: { initialCommunities: Community[] }) {
  const [communityTypeFilter, setCommunityTypeFilter] = useState<CommunityType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CommunityStatus | 'all'>('all')
  const { communities, loading, error } = useCommunity({ communityType: communityTypeFilter, status: statusFilter })

  const displayCommunities = communities.length > 0 ? communities : initialCommunities

  const stats = [
    {
      label: 'Members',
      value: displayCommunities.reduce((sum, c) => sum + c.member_count, 0).toString(),
      change: 12.5,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Active Today',
      value: displayCommunities.reduce((sum, c) => sum + c.active_members, 0).toString(),
      change: 25.3,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Posts',
      value: displayCommunities.reduce((sum, c) => sum + c.post_count, 0).toString(),
      change: 15.2,
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      label: 'Engagement',
      value: displayCommunities.length > 0
        ? `${(displayCommunities.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / displayCommunities.length).toFixed(0)}%`
        : '0%',
      change: 8.7,
      icon: <Heart className="w-5 h-5" />
    }
  ]

  const recentActivity = displayCommunities.slice(0, 4).map((c, idx) => ({
    icon: <Users className="w-5 h-5" />,
    title: c.is_public ? 'Public community' : 'Private community',
    description: c.community_name,
    time: new Date(c.created_at).toLocaleDateString(),
    status: c.status === 'active' ? 'success' as const : 'info' as const
  }))

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
          <GradientButton from="orange" to="amber" onClick={() => console.log('New community')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Community
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Community" description="Create" onClick={() => console.log('Create')} />
          <BentoQuickAction icon={<MessageSquare />} title="Discussions" description="Join" onClick={() => console.log('Discussions')} />
          <BentoQuickAction icon={<Users />} title="Members" description="Browse" onClick={() => console.log('Members')} />
          <BentoQuickAction icon={<Award />} title="Leaderboard" description="Top contributors" onClick={() => console.log('Leaderboard')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={communityTypeFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setCommunityTypeFilter('all')}>
            All Types
          </PillButton>
          <PillButton variant={communityTypeFilter === 'public' ? 'primary' : 'ghost'} onClick={() => setCommunityTypeFilter('public')}>
            Public
          </PillButton>
          <PillButton variant={communityTypeFilter === 'private' ? 'primary' : 'ghost'} onClick={() => setCommunityTypeFilter('private')}>
            Private
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {displayCommunities.map((community) => (
                <BentoCard key={community.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <h4 className="font-semibold text-lg">{community.community_name}</h4>
                        {community.description && <p className="text-sm text-muted-foreground">{community.description}</p>}
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {community.member_count} members
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {community.post_count} posts
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {community.like_count} likes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm">View</ModernButton>
                        <ModernButton variant="outline" size="sm">Join</ModernButton>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              ))}

              {displayCommunities.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first community</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Posts Today" value={displayCommunities.reduce((sum, c) => sum + c.post_count, 0).toString()} change={25.3} />
                <MiniKPI label="Active Discussions" value={displayCommunities.reduce((sum, c) => sum + c.discussion_count, 0).toString()} change={15.2} />
                <MiniKPI label="Total Engagement" value={displayCommunities.reduce((sum, c) => sum + c.engagement_score, 0).toFixed(0)} change={12.5} />
                <MiniKPI label="Member Growth" value={`+${displayCommunities.reduce((sum, c) => sum + (c.growth_rate || 0), 0).toFixed(1)}%`} change={12.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
