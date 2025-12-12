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
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Award,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles
} from 'lucide-react'

/**
 * Sales V2 - Groundbreaking Sales Pipeline Management
 * Showcases sales performance and pipeline with modern components
 */
export default function SalesV2() {
  const [selectedStage, setSelectedStage] = useState<'all' | 'lead' | 'qualified' | 'proposal' | 'closed'>('all')

  const stats = [
    { label: 'Pipeline Value', value: '$847K', change: 42.1, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Deals Closed', value: '124', change: 28.5, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Win Rate', value: '67%', change: 15.3, icon: <Award className="w-5 h-5" /> },
    { label: 'Avg Deal Size', value: '$6.8K', change: 22.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const deals = [
    {
      id: '1',
      company: 'Acme Corporation',
      contact: 'Sarah Johnson',
      value: 45000,
      stage: 'proposal',
      probability: 75,
      expectedClose: '15 days',
      lastContact: '2 hours ago'
    },
    {
      id: '2',
      company: 'Tech Innovations',
      contact: 'Michael Chen',
      value: 28000,
      stage: 'qualified',
      probability: 50,
      expectedClose: '30 days',
      lastContact: '1 day ago'
    },
    {
      id: '3',
      company: 'Global Enterprises',
      contact: 'Emily Rodriguez',
      value: 67000,
      stage: 'proposal',
      probability: 85,
      expectedClose: '7 days',
      lastContact: '5 hours ago'
    },
    {
      id: '4',
      company: 'StartUp Hub',
      contact: 'David Kim',
      value: 15000,
      stage: 'lead',
      probability: 25,
      expectedClose: '60 days',
      lastContact: '3 days ago'
    }
  ]

  const pipelineStages = [
    { stage: 'Lead', count: 45, value: 234000, color: 'from-blue-500 to-cyan-500' },
    { stage: 'Qualified', count: 28, value: 342000, color: 'from-purple-500 to-pink-500' },
    { stage: 'Proposal', count: 12, value: 487000, color: 'from-orange-500 to-red-500' },
    { stage: 'Negotiation', count: 8, value: 247000, color: 'from-yellow-500 to-amber-500' },
    { stage: 'Closed Won', count: 24, value: 847000, color: 'from-green-500 to-emerald-500' }
  ]

  const topSalesReps = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ', value: '$124K', change: 42.1 },
    { rank: 2, name: 'Michael Chen', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC', value: '$98K', change: 35.3 },
    { rank: 3, name: 'Emily Rodriguez', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER', value: '$87K', change: 28.5 },
    { rank: 4, name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK', value: '$76K', change: 22.1 },
    { rank: 5, name: 'Lisa Wang', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LW', value: '$64K', change: 18.7 }
  ]

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-700'
      case 'qualified': return 'bg-purple-100 text-purple-700'
      case 'proposal': return 'bg-orange-100 text-orange-700'
      case 'negotiation': return 'bg-yellow-100 text-yellow-700'
      case 'closed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600'
    if (probability >= 50) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const maxValue = Math.max(...pipelineStages.map(s => s.value))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              Sales Dashboard
            </h1>
            <p className="text-muted-foreground">Manage pipeline and track revenue performance</p>
          </div>
          <GradientButton from="green" to="emerald" onClick={() => console.log('New deal')}>
            <Sparkles className="w-5 h-5 mr-2" />
            Add Deal
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Pipeline" description="View all" onClick={() => console.log('Pipeline')} />
          <BentoQuickAction icon={<Users />} title="Contacts" description="CRM" onClick={() => console.log('Contacts')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Reports" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Award />} title="Leaderboard" description="Top reps" onClick={() => console.log('Leaderboard')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStage === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('all')}>
            All Deals
          </PillButton>
          <PillButton variant={selectedStage === 'lead' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('lead')}>
            Leads
          </PillButton>
          <PillButton variant={selectedStage === 'qualified' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('qualified')}>
            Qualified
          </PillButton>
          <PillButton variant={selectedStage === 'proposal' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('proposal')}>
            Proposal
          </PillButton>
          <PillButton variant={selectedStage === 'closed' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('closed')}>
            Closed
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Sales Pipeline</h3>
          <div className="space-y-4">
            {pipelineStages.map((stage) => {
              const valuePercent = (stage.value / maxValue) * 100

              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stage.color} flex items-center justify-center text-white font-bold`}>
                        {stage.count}
                      </div>
                      <span className="font-semibold">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{stage.count} deals</span>
                      <span className="font-bold">${(stage.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-300`}
                      style={{ width: `${valuePercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Active Deals</h3>
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div key={deal.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{deal.company}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStageColor(deal.stage)}`}>
                            {deal.stage}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{deal.contact}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Deal Value</p>
                        <p className="text-xl font-bold text-green-600">${(deal.value / 1000).toFixed(1)}K</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                      <div>
                        <p className="text-muted-foreground">Probability</p>
                        <p className={`font-semibold ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Close</p>
                        <p className="font-semibold">{deal.expectedClose}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Contact</p>
                        <p className="font-semibold">{deal.lastContact}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('View', deal.id)}>
                        View Details
                      </ModernButton>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Contact', deal.id)}>
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </ModernButton>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Call', deal.id)}>
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Sales Reps" items={topSalesReps} />

            <div className="grid grid-cols-1 gap-6">
              <ComparisonCard
                title="Revenue Comparison"
                current={{ label: 'This Month', value: 847000 }}
                previous={{ label: 'Last Month', value: 624000 }}
              />
            </div>

            <ProgressCard
              title="Quarterly Revenue Goal"
              current={847000}
              goal={2000000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Sales Cycle" value="45 days" change={-12.5} />
                <MiniKPI label="Lead Response Time" value="2.4h" change={-18.7} />
                <MiniKPI label="Quota Attainment" value="94%" change={15.3} />
                <MiniKPI label="Forecast Accuracy" value="87%" change={8.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
