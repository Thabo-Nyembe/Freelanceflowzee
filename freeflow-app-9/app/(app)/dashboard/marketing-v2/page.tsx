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
  Sparkles
} from 'lucide-react'

/**
 * Marketing V2 - Groundbreaking Marketing Dashboard
 * Showcases marketing campaigns and performance with modern components
 */
export default function MarketingV2() {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'social' | 'email' | 'content'>('all')

  const stats = [
    { label: 'Campaign Reach', value: '847K', change: 42.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Engagement Rate', value: '8.4%', change: 25.3, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'Conversions', value: '12.4K', change: 35.7, icon: <Target className="w-5 h-5" /> },
    { label: 'ROI', value: '4.2x', change: 18.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const campaigns = [
    {
      id: '1',
      name: 'Spring Product Launch',
      channel: 'Multi-channel',
      status: 'active',
      reach: 247000,
      engagement: 8.4,
      conversions: 3420,
      budget: 25000,
      spent: 18500,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '2',
      name: 'Social Media Awareness',
      channel: 'Social Media',
      status: 'active',
      reach: 342000,
      engagement: 12.7,
      conversions: 1890,
      budget: 15000,
      spent: 12000,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      name: 'Email Nurture Series',
      channel: 'Email',
      status: 'completed',
      reach: 124000,
      engagement: 18.3,
      conversions: 4560,
      budget: 8000,
      spent: 8000,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      name: 'Content Marketing Push',
      channel: 'Content',
      status: 'planned',
      reach: 0,
      engagement: 0,
      conversions: 0,
      budget: 20000,
      spent: 0,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const marketingChannels = [
    {
      name: 'Social Media',
      reach: 342000,
      engagement: 12.7,
      conversions: 1890,
      cost: 12000,
      icon: <Share2 className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Email Marketing',
      reach: 124000,
      engagement: 18.3,
      conversions: 4560,
      cost: 8000,
      icon: <Mail className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Content Marketing',
      reach: 247000,
      engagement: 8.4,
      conversions: 3420,
      cost: 18500,
      icon: <Globe className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Paid Advertising',
      reach: 134000,
      engagement: 6.2,
      conversions: 2530,
      cost: 25000,
      icon: <Target className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const topPerformers = [
    { rank: 1, name: 'Email Nurture Series', avatar: '📧', value: '4.5K', change: 35.7 },
    { rank: 2, name: 'Spring Launch', avatar: '🚀', value: '3.4K', change: 28.3 },
    { rank: 3, name: 'Paid Ads Campaign', avatar: '🎯', value: '2.5K', change: 22.1 },
    { rank: 4, name: 'Social Awareness', avatar: '📱', value: '1.9K', change: 18.5 },
    { rank: 5, name: 'Content Series', avatar: '📝', value: '1.2K', change: 15.3 }
  ]

  const recentActivity = [
    { icon: <Target className="w-5 h-5" />, title: 'Campaign launched', description: 'Spring Product Launch went live', time: '2 hours ago', status: 'success' as const },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Milestone reached', description: '10K conversions this month', time: '1 day ago', status: 'success' as const },
    { icon: <Award className="w-5 h-5" />, title: 'Top performer', description: 'Email campaign exceeded goals', time: '3 days ago', status: 'success' as const },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Analytics updated', description: 'Monthly report generated', time: '1 week ago', status: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'planned': return 'bg-yellow-100 text-yellow-700'
      case 'paused': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxReach = Math.max(...campaigns.map(c => c.reach))

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
          <GradientButton from="pink" to="rose" onClick={() => console.log('New campaign')}>
            <Sparkles className="w-5 h-5 mr-2" />
            New Campaign
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Campaigns" description="All campaigns" onClick={() => console.log('Campaigns')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Insights" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Users />} title="Audience" description="Segments" onClick={() => console.log('Audience')} />
          <BentoQuickAction icon={<Award />} title="Performance" description="Top content" onClick={() => console.log('Performance')} />
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
              <h3 className="text-xl font-semibold mb-4">Active Campaigns</h3>
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const reachPercent = campaign.reach > 0 ? (campaign.reach / maxReach) * 100 : 0
                  const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0

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
                            <p className="text-sm text-muted-foreground mb-2">{campaign.channel}</p>
                          </div>
                        </div>

                        {campaign.status !== 'planned' && (
                          <>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-muted-foreground">Reach</p>
                                <p className="font-semibold">{(campaign.reach / 1000).toFixed(0)}K</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Engagement</p>
                                <p className="font-semibold">{campaign.engagement}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Conversions</p>
                                <p className="font-semibold">{campaign.conversions.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${campaign.color} transition-all duration-300`}
                                style={{ width: `${reachPercent}%` }}
                              />
                            </div>
                          </>
                        )}

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
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Marketing Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketingChannels.map((channel) => (
                  <div key={channel.name} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${channel.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {channel.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{channel.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Reach</p>
                            <p className="font-semibold">{(channel.reach / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Engagement</p>
                            <p className="font-semibold">{channel.engagement}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Conversions</p>
                            <p className="font-semibold">{channel.conversions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cost</p>
                            <p className="font-semibold">${(channel.cost / 1000).toFixed(1)}K</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Campaigns" items={topPerformers} />

            <ProgressCard
              title="Monthly Conversion Goal"
              current={12400}
              goal={15000}
              unit=""
              icon={<Target className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg CTR" value="8.4%" change={25.3} />
                <MiniKPI label="Cost per Click" value="$2.47" change={-12.5} />
                <MiniKPI label="Conversion Rate" value="3.6%" change={18.7} />
                <MiniKPI label="Customer Acquisition" value="$67" change={-8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
