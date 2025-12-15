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
  Megaphone,
  Target,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Share2,
  Award,
  BarChart3,
  Globe,
  Mail,
  Sparkles,
  Plus,
  Play,
  Pause,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useMarketingCampaigns, useMarketingChannels, MarketingCampaign, MarketingChannel } from '@/lib/hooks/use-marketing'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MarketingClientProps {
  initialCampaigns: MarketingCampaign[]
  initialChannels: MarketingChannel[]
}

export default function MarketingClient({ initialCampaigns, initialChannels }: MarketingClientProps) {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'social' | 'email' | 'content'>('all')
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    channel: 'multi-channel',
    campaign_type: 'awareness',
    budget: 0,
    target_audience: ''
  })

  const {
    campaigns,
    loading: campaignsLoading,
    createCampaign,
    updateCampaign,
    startCampaign,
    pauseCampaign,
    completeCampaign,
    getStats
  } = useMarketingCampaigns()
  const { channels, loading: channelsLoading } = useMarketingChannels()

  const displayCampaigns = campaigns.length > 0 ? campaigns : initialCampaigns
  const displayChannels = channels.length > 0 ? channels : initialChannels
  const stats = getStats()

  const statCards = [
    { label: 'Campaign Reach', value: stats.totalReach > 1000 ? `${(stats.totalReach / 1000).toFixed(0)}K` : stats.totalReach.toString(), change: 42.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Engagement Rate', value: `${stats.avgEngagementRate.toFixed(1)}%`, change: 25.3, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'Conversions', value: stats.totalConversions > 1000 ? `${(stats.totalConversions / 1000).toFixed(1)}K` : stats.totalConversions.toString(), change: 35.7, icon: <Target className="w-5 h-5" /> },
    { label: 'ROI', value: `${stats.roi.toFixed(1)}x`, change: 18.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const topPerformers = displayCampaigns
    .filter(c => c.status !== 'draft')
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5)
    .map((c, i) => ({
      rank: i + 1,
      name: c.name,
      avatar: c.channel === 'email' ? '📧' : c.channel === 'social' ? '📱' : '🎯',
      value: `${(c.conversions / 1000).toFixed(1)}K`,
      change: c.conversion_rate
    }))

  const recentActivity = displayCampaigns
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4)
    .map(c => ({
      icon: <Target className="w-5 h-5" />,
      title: c.status === 'active' ? 'Campaign active' : c.status === 'completed' ? 'Campaign completed' : 'Campaign updated',
      description: c.name,
      time: new Date(c.updated_at).toLocaleDateString(),
      status: c.status === 'completed' ? 'success' as const : 'info' as const
    }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'paused': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'social': return <Share2 className="w-5 h-5" />
      case 'email': return <Mail className="w-5 h-5" />
      case 'content': return <Globe className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case 'social': return 'from-blue-500 to-cyan-500'
      case 'email': return 'from-purple-500 to-pink-500'
      case 'content': return 'from-green-500 to-emerald-500'
      default: return 'from-orange-500 to-red-500'
    }
  }

  const maxReach = Math.max(...displayCampaigns.map(c => c.reach), 1)

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) return
    try {
      await createCampaign(newCampaign)
      setShowNewCampaign(false)
      setNewCampaign({ name: '', description: '', channel: 'multi-channel', campaign_type: 'awareness', budget: 0, target_audience: '' })
    } catch (error) {
      console.error('Failed to create campaign:', error)
    }
  }

  const filteredCampaigns = selectedChannel === 'all'
    ? displayCampaigns
    : displayCampaigns.filter(c => c.channel?.toLowerCase().includes(selectedChannel))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Megaphone className="w-10 h-10 text-pink-600" />
              Marketing Dashboard
            </h1>
            <p className="text-muted-foreground">Track campaigns and optimize marketing performance</p>
          </div>
          <GradientButton from="pink" to="rose" onClick={() => setShowNewCampaign(true)}>
            <Sparkles className="w-5 h-5 mr-2" />
            New Campaign
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statCards} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Campaigns" description={`${displayCampaigns.length} total`} onClick={() => {}} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Insights" onClick={() => {}} />
          <BentoQuickAction icon={<Users />} title="Audience" description="Segments" onClick={() => {}} />
          <BentoQuickAction icon={<Award />} title="Performance" description="Top content" onClick={() => {}} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedChannel === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedChannel('all')}>
            All Channels
          </PillButton>
          <PillButton variant={selectedChannel === 'social' ? 'primary' : 'ghost'} onClick={() => setSelectedChannel('social')}>
            <Share2 className="w-4 h-4 mr-2" />
            Social
          </PillButton>
          <PillButton variant={selectedChannel === 'email' ? 'primary' : 'ghost'} onClick={() => setSelectedChannel('email')}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </PillButton>
          <PillButton variant={selectedChannel === 'content' ? 'primary' : 'ghost'} onClick={() => setSelectedChannel('content')}>
            <Globe className="w-4 h-4 mr-2" />
            Content
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Active Campaigns</h3>
                {campaignsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="space-y-4">
                {filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No campaigns yet. Create your first campaign!</p>
                  </div>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const reachPercent = campaign.reach > 0 ? (campaign.reach / maxReach) * 100 : 0
                    const budgetUsed = campaign.budget && campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0

                    return (
                      <div key={campaign.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{campaign.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(campaign.status)}`}>
                                  {campaign.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{campaign.channel || 'Multi-channel'}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {campaign.status === 'draft' && (
                                <ModernButton variant="ghost" size="sm" onClick={() => startCampaign(campaign.id)}>
                                  <Play className="w-3 h-3" />
                                </ModernButton>
                              )}
                              {campaign.status === 'active' && (
                                <>
                                  <ModernButton variant="ghost" size="sm" onClick={() => pauseCampaign(campaign.id)}>
                                    <Pause className="w-3 h-3" />
                                  </ModernButton>
                                  <ModernButton variant="ghost" size="sm" onClick={() => completeCampaign(campaign.id)}>
                                    <CheckCircle className="w-3 h-3" />
                                  </ModernButton>
                                </>
                              )}
                            </div>
                          </div>

                          {campaign.status !== 'draft' && (
                            <>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Reach</p>
                                  <p className="font-semibold">{(campaign.reach / 1000).toFixed(0)}K</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Engagement</p>
                                  <p className="font-semibold">{campaign.engagement_rate.toFixed(1)}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Conversions</p>
                                  <p className="font-semibold">{campaign.conversions.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                                  style={{ width: `${reachPercent}%` }}
                                />
                              </div>
                            </>
                          )}

                          {campaign.budget && campaign.budget > 0 && (
                            <>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Budget: ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                                </span>
                                <span className="font-semibold">{budgetUsed.toFixed(0)}% used</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-pink-600 to-rose-600"
                                  style={{ width: `${budgetUsed}%` }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Marketing Channels</h3>
                {channelsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayChannels.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No channels configured yet.</p>
                  </div>
                ) : (
                  displayChannels.map((channel) => (
                    <div key={channel.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getChannelColor(channel.channel_type)} flex items-center justify-center text-white flex-shrink-0`}>
                          {getChannelIcon(channel.channel_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{channel.name}</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Reach</p>
                              <p className="font-semibold">{(channel.total_reach / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Engagement</p>
                              <p className="font-semibold">{channel.avg_engagement_rate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conversions</p>
                              <p className="font-semibold">{channel.total_conversions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Cost</p>
                              <p className="font-semibold">${(channel.total_cost / 1000).toFixed(1)}K</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Campaigns" items={topPerformers.length > 0 ? topPerformers : [
              { rank: 1, name: 'No campaigns yet', avatar: '📊', value: '-', change: 0 }
            ]} />

            <ProgressCard
              title="Monthly Conversion Goal"
              current={stats.totalConversions}
              goal={15000}
              unit=""
              icon={<Target className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity.length > 0 ? recentActivity : [
              { icon: <Megaphone className="w-5 h-5" />, title: 'Get started', description: 'Create your first campaign', time: 'Now', status: 'info' as const }
            ]} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg CTR" value={`${stats.avgEngagementRate.toFixed(1)}%`} change={25.3} />
                <MiniKPI label="Cost per Click" value={`$${(stats.totalSpent / Math.max(stats.totalClicks, 1)).toFixed(2)}`} change={-12.5} />
                <MiniKPI label="Conversion Rate" value={`${stats.avgConversionRate.toFixed(1)}%`} change={18.7} />
                <MiniKPI label="Total Spend" value={`$${(stats.totalSpent / 1000).toFixed(1)}K`} change={-8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new marketing campaign to reach your audience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Spring Product Launch"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                placeholder="Campaign objectives and details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="channel">Channel</Label>
                <Select value={newCampaign.channel} onValueChange={(v) => setNewCampaign({ ...newCampaign, channel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multi-channel">Multi-channel</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="paid">Paid Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCampaign.budget || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseInt(e.target.value) || 0 })}
                  placeholder="10000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                value={newCampaign.target_audience}
                onChange={(e) => setNewCampaign({ ...newCampaign, target_audience: e.target.value })}
                placeholder="e.g., Small business owners, 25-45"
              />
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowNewCampaign(false)}>
              Cancel
            </ModernButton>
            <GradientButton from="pink" to="rose" onClick={handleCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
