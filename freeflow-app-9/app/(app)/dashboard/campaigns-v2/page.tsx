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
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Rocket,
  Target,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Play,
  Pause,
  Settings,
  BarChart3,
  Award,
  Zap
} from 'lucide-react'

/**
 * Campaigns V2 - Groundbreaking Campaign Management
 * Showcases campaign performance and optimization with modern components
 */
export default function CampaignsV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'scheduled' | 'completed'>('all')

  const stats = [
    { label: 'Active Campaigns', value: '42', change: 25.3, icon: <Rocket className="w-5 h-5" /> },
    { label: 'Total Reach', value: '847K', change: 42.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Engagement Rate', value: '12.4%', change: 18.7, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'ROI', value: '4.8x', change: 35.2, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const campaigns = [
    {
      id: '1',
      name: 'Summer Product Launch',
      objective: 'Brand Awareness',
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-07-31',
      budget: 50000,
      spent: 32000,
      reach: 342000,
      engagement: 14.7,
      conversions: 4560,
      roi: 5.2,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '2',
      name: 'Email Nurture Series Q3',
      objective: 'Lead Generation',
      status: 'active',
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      budget: 15000,
      spent: 8500,
      reach: 124000,
      engagement: 22.3,
      conversions: 2890,
      roi: 6.8,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      name: 'Social Media Blitz',
      objective: 'Engagement',
      status: 'scheduled',
      startDate: '2024-08-15',
      endDate: '2024-09-15',
      budget: 25000,
      spent: 0,
      reach: 0,
      engagement: 0,
      conversions: 0,
      roi: 0,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      name: 'Spring Flash Sale',
      objective: 'Sales',
      status: 'completed',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      budget: 20000,
      spent: 20000,
      reach: 247000,
      engagement: 18.4,
      conversions: 5670,
      roi: 8.4,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const campaignObjectives = [
    { type: 'Brand Awareness', count: 12, budget: 150000, color: 'from-orange-500 to-red-500', icon: <Eye className="w-5 h-5" /> },
    { type: 'Lead Generation', count: 15, budget: 95000, color: 'from-blue-500 to-cyan-500', icon: <Target className="w-5 h-5" /> },
    { type: 'Sales', count: 8, budget: 120000, color: 'from-green-500 to-emerald-500', icon: <TrendingUp className="w-5 h-5" /> },
    { type: 'Engagement', count: 7, budget: 45000, color: 'from-purple-500 to-pink-500', icon: <Users className="w-5 h-5" /> }
  ]

  const recentActivity = [
    { icon: <Rocket className="w-5 h-5" />, title: 'Campaign launched', description: 'Email Nurture Series Q3 started', time: '2 hours ago', status: 'success' as const },
    { icon: <Award className="w-5 h-5" />, title: 'Goal exceeded', description: 'Summer Launch hit 150% ROI target', time: '1 day ago', status: 'success' as const },
    { icon: <Zap className="w-5 h-5" />, title: 'High performance', description: 'Spring Sale achieved 8.4x ROI', time: '3 days ago', status: 'success' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Campaign scheduled', description: 'Social Media Blitz planned for Aug 15', time: '1 week ago', status: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'scheduled': return <Calendar className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      default: return <Rocket className="w-3 h-3" />
    }
  }

  const maxBudget = Math.max(...campaignObjectives.map(o => o.budget))

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Rocket className="w-10 h-10 text-orange-600" />
              Campaigns
            </h1>
            <p className="text-muted-foreground">Plan, launch, and optimize marketing campaigns</p>
          </div>
          <GradientButton from="orange" to="amber" onClick={() => console.log('New campaign')}>
            <Rocket className="w-5 h-5 mr-2" />
            Create Campaign
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Rocket />} title="Campaigns" description="All campaigns" onClick={() => console.log('All')} />
          <BentoQuickAction icon={<Target />} title="Templates" description="Pre-built" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Campaigns
          </PillButton>
          <PillButton variant={selectedStatus === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('active')}>
            <Play className="w-4 h-4 mr-2" />
            Active
          </PillButton>
          <PillButton variant={selectedStatus === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('scheduled')}>
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled
          </PillButton>
          <PillButton variant={selectedStatus === 'completed' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('completed')}>
            Completed
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Campaign Performance</h3>
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0

                  return (
                    <div key={campaign.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{campaign.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                                {getStatusIcon(campaign.status)}
                                {campaign.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{campaign.objective}</p>
                          </div>
                          {campaign.status === 'active' && (
                            <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${campaign.color} text-white text-sm font-semibold`}>
                              {campaign.roi}x ROI
                            </div>
                          )}
                        </div>

                        {campaign.status !== 'scheduled' && (
                          <div className="grid grid-cols-4 gap-3 text-xs">
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
                            <div>
                              <p className="text-muted-foreground">ROI</p>
                              <p className="font-semibold text-green-600">{campaign.roi}x</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {campaign.startDate} - {campaign.endDate}
                            </span>
                            <span className="font-semibold">
                              ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${campaign.color}`}
                              style={{ width: `${budgetUsed}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Campaign Objectives</h3>
              <div className="space-y-4">
                {campaignObjectives.map((objective) => {
                  const budgetPercent = (objective.budget / maxBudget) * 100

                  return (
                    <div key={objective.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${objective.color} flex items-center justify-center text-white`}>
                            {objective.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{objective.type}</p>
                            <p className="text-xs text-muted-foreground">{objective.count} campaigns</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(objective.budget / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">Total budget</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${objective.color} transition-all duration-300`}
                          style={{ width: `${budgetPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Monthly Campaign Goal"
              current={42}
              goal={60}
              unit=""
              icon={<Rocket className="w-5 h-5" />}
            />

            <ProgressCard
              title="Quarterly Budget"
              current={410000}
              goal={500000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg ROI" value="5.8x" change={35.2} />
                <MiniKPI label="Avg Engagement" value="16.9%" change={22.7} />
                <MiniKPI label="Campaign Success" value="87%" change={12.5} />
                <MiniKPI label="Budget Efficiency" value="94%" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
