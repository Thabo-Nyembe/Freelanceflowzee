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
  Map,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Star,
  Zap,
  Flag,
  Award,
  BarChart3,
  Plus,
  Eye
} from 'lucide-react'
import { useRoadmapInitiatives, useRoadmapMilestones, useRoadmapStats, type RoadmapInitiative, type RoadmapMilestone } from '@/lib/hooks/use-roadmap'
import { updateInitiativeProgress, updateInitiativeStatus } from '@/app/actions/roadmap'

interface RoadmapClientProps {
  initialInitiatives: RoadmapInitiative[]
  initialMilestones: RoadmapMilestone[]
}

export default function RoadmapClient({ initialInitiatives, initialMilestones }: RoadmapClientProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Use hooks for real-time data
  const { data: initiatives } = useRoadmapInitiatives({
    quarter: selectedQuarter === 'all' ? undefined : selectedQuarter,
    searchQuery: searchQuery || undefined
  })
  const { data: milestones } = useRoadmapMilestones({})
  const { stats } = useRoadmapStats()

  const displayInitiatives = initiatives || initialInitiatives
  const displayMilestones = milestones || initialMilestones

  const filteredInitiatives = selectedQuarter === 'all'
    ? displayInitiatives
    : displayInitiatives.filter(initiative => initiative.quarter === selectedQuarter)

  const statItems = [
    { label: 'Active Initiatives', value: stats?.totalInitiatives?.toString() || displayInitiatives.length.toString(), change: 28.4, icon: <Flag className="w-5 h-5" /> },
    { label: 'Completion Rate', value: stats?.totalInitiatives ? `${Math.round((stats.completedInitiatives / stats.totalInitiatives) * 100)}%` : '0%', change: 15.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Progress', value: `${Math.round(stats?.averageProgress || 0)}%`, change: 42.1, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'High Priority', value: stats?.highPriorityCount?.toString() || '0', change: 12.5, icon: <Star className="w-5 h-5" /> }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Initiative completed', description: 'SSO Integration shipped', time: '2 days ago', status: 'success' as const },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Progress update', description: 'AI Content reached 65%', time: '1 week ago', status: 'success' as const },
    { icon: <Flag className="w-5 h-5" />, title: 'New initiative', description: 'Added to Q4', time: '2 weeks ago', status: 'info' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Milestone achieved', description: 'Q1 Launch completed', time: '1 month ago', status: 'success' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'planned': return 'bg-purple-100 text-purple-700'
      case 'on_track': return 'bg-green-100 text-green-700'
      case 'at_risk': return 'bg-yellow-100 text-yellow-700'
      case 'on_hold': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600'
      case 'very_high': return 'text-orange-600'
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getGradientColor = (index: number) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-amber-500'
    ]
    return colors[index % colors.length]
  }

  const handleStartInitiative = async (initiativeId: string) => {
    await updateInitiativeStatus(initiativeId, 'in_progress')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Map className="w-10 h-10 text-teal-600" />
              Product Roadmap
            </h1>
            <p className="text-muted-foreground">Strategic planning and initiative tracking</p>
          </div>
          <GradientButton from="teal" to="cyan" onClick={() => console.log('New initiative')}>
            <Plus className="w-5 h-5 mr-2" />
            New Initiative
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Flag />} title="Initiatives" description="All items" onClick={() => console.log('Initiatives')} />
          <BentoQuickAction icon={<Calendar />} title="Timeline" description="Schedule" onClick={() => console.log('Timeline')} />
          <BentoQuickAction icon={<Target />} title="Themes" description="Strategic areas" onClick={() => console.log('Themes')} />
          <BentoQuickAction icon={<BarChart3 />} title="Reports" description="Analytics" onClick={() => console.log('Reports')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedQuarter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('all')}>
            All Quarters
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q1' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q1')}>
            Q1 {new Date().getFullYear()}
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q2' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q2')}>
            Q2 {new Date().getFullYear()}
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q3' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q3')}>
            Q3 {new Date().getFullYear()}
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q4' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q4')}>
            Q4 {new Date().getFullYear()}
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Strategic Initiatives</h3>
              <div className="space-y-3">
                {filteredInitiatives.map((initiative, index) => (
                  <div key={initiative.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{initiative.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(initiative.status)}`}>
                              {initiative.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getPriorityColor(initiative.priority)}`}>
                              {initiative.priority}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{initiative.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-md bg-muted">{initiative.quarter} {initiative.year}</span>
                            {initiative.team && <span className="px-2 py-1 rounded-md bg-muted">{initiative.team}</span>}
                          </div>
                        </div>
                        {initiative.status !== 'planned' && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-teal-600">{initiative.progress_percentage}%</p>
                            <p className="text-xs text-muted-foreground">Complete</p>
                          </div>
                        )}
                      </div>

                      {initiative.status !== 'planned' && (
                        <div className="space-y-1">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getGradientColor(index)}`}
                              style={{ width: `${initiative.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t">
                        <div>
                          <p className="text-muted-foreground">Impact</p>
                          <p className={`font-semibold capitalize ${getImpactColor(initiative.impact)}`}>
                            {initiative.impact.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Effort</p>
                          <p className="font-semibold capitalize">{initiative.effort.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stakeholders</p>
                          <p className="font-semibold">{initiative.stakeholders?.length || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <div className="flex flex-wrap gap-1 flex-1">
                          {initiative.stakeholders?.slice(0, 3).map((stakeholder) => (
                            <span key={stakeholder} className="text-xs px-2 py-1 rounded-md bg-muted">
                              {stakeholder}
                            </span>
                          ))}
                          {(initiative.stakeholders?.length || 0) > 3 && (
                            <span className="text-xs px-2 py-1 rounded-md bg-muted">
                              +{(initiative.stakeholders?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', initiative.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', initiative.id)}>
                            Edit
                          </ModernButton>
                          {initiative.status === 'planned' && (
                            <ModernButton variant="primary" size="sm" onClick={() => handleStartInitiative(initiative.id)}>
                              Start
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Key Milestones</h3>
              <div className="space-y-3">
                {displayMilestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{milestone.milestone_name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(milestone.target_date).toLocaleDateString()}
                          </span>
                          <span>{milestone.initiatives_count} initiatives</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{milestone.completion_percentage}%</p>
                      </div>
                    </div>
                    {milestone.completion_percentage > 0 && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-600 to-cyan-600"
                          style={{ width: `${milestone.completion_percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Strategic Themes</h3>
              <div className="space-y-4">
                {stats?.byTheme && Object.entries(stats.byTheme).map(([theme, count], index) => (
                  <div key={theme} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getGradientColor(index)} flex items-center justify-center text-white`}>
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{theme}</p>
                          <p className="text-xs text-muted-foreground">{count} initiatives</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getGradientColor(index)} transition-all duration-300`}
                        style={{ width: `${(count / (stats.totalInitiatives || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Overall Progress"
              value={Math.round(stats?.averageProgress || 0)}
              target={100}
              label="% average completion"
              color="from-teal-500 to-cyan-500"
            />

            <ProgressCard
              title="Completed"
              value={stats?.completedInitiatives || 0}
              target={stats?.totalInitiatives || 1}
              label="initiatives completed"
              color="from-green-500 to-emerald-500"
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Roadmap Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Initiatives" value={stats?.totalInitiatives?.toString() || '0'} change={28.4} />
                <MiniKPI label="In Progress" value={stats?.inProgressInitiatives?.toString() || '0'} change={15.3} />
                <MiniKPI label="Completed" value={stats?.completedInitiatives?.toString() || '0'} change={42.1} />
                <MiniKPI label="High Priority" value={stats?.highPriorityCount?.toString() || '0'} change={12.5} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Export')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Export Timeline
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Share')}>
                  <Users className="w-4 h-4 mr-2" />
                  Share Roadmap
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Settings')}>
                  <Target className="w-4 h-4 mr-2" />
                  Configure Themes
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
