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

/**
 * Roadmap V2 - Groundbreaking Product Roadmap Planning
 * Showcases product initiatives, timelines, and strategic planning
 */
export default function RoadmapV2() {
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q2')

  const stats = [
    { label: 'Active Initiatives', value: '47', change: 28.4, icon: <Flag className="w-5 h-5" /> },
    { label: 'Completion Rate', value: '84%', change: 15.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'User Impact', value: '247K', change: 42.1, icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Priority', value: '8.4/10', change: 12.5, icon: <Star className="w-5 h-5" /> }
  ]

  const initiatives = [
    {
      id: '1',
      title: 'AI-Powered Content Creation',
      description: 'Intelligent content generation and optimization',
      quarter: 'Q2',
      status: 'in_progress',
      priority: 'high',
      progress: 65,
      team: 'Product Innovation',
      stakeholders: ['Engineering', 'Design', 'Marketing'],
      impact: 'high',
      effort: 'large',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '2',
      title: 'Mobile App Redesign',
      description: 'Complete overhaul of iOS and Android apps',
      quarter: 'Q2',
      status: 'in_progress',
      priority: 'high',
      progress: 42,
      team: 'Mobile',
      stakeholders: ['Design', 'Engineering', 'Product'],
      impact: 'high',
      effort: 'large',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      title: 'Advanced Analytics Dashboard',
      description: 'Real-time metrics and custom reports',
      quarter: 'Q3',
      status: 'planned',
      priority: 'medium',
      progress: 0,
      team: 'Analytics',
      stakeholders: ['Engineering', 'Data Science'],
      impact: 'medium',
      effort: 'medium',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      title: 'API v3 Launch',
      description: 'Next-generation API with GraphQL support',
      quarter: 'Q3',
      status: 'planned',
      priority: 'high',
      progress: 0,
      team: 'Platform',
      stakeholders: ['Engineering', 'Developer Relations'],
      impact: 'high',
      effort: 'large',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      title: 'Enterprise SSO Integration',
      description: 'SAML and OAuth enterprise authentication',
      quarter: 'Q1',
      status: 'completed',
      priority: 'high',
      progress: 100,
      team: 'Security',
      stakeholders: ['Engineering', 'Sales', 'Security'],
      impact: 'high',
      effort: 'medium',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '6',
      title: 'Collaboration Features',
      description: 'Real-time co-editing and comments',
      quarter: 'Q4',
      status: 'planned',
      priority: 'medium',
      progress: 0,
      team: 'Collaboration',
      stakeholders: ['Engineering', 'Product', 'Design'],
      impact: 'high',
      effort: 'large',
      color: 'from-yellow-500 to-amber-500'
    }
  ]

  const milestones = [
    {
      id: '1',
      name: 'Q1 Product Launch',
      date: '2024-03-31',
      status: 'completed',
      initiatives: 8,
      completion: 100
    },
    {
      id: '2',
      name: 'Q2 Feature Release',
      date: '2024-06-30',
      status: 'on_track',
      initiatives: 12,
      completion: 58
    },
    {
      id: '3',
      name: 'Q3 Platform Update',
      date: '2024-09-30',
      status: 'planned',
      initiatives: 10,
      completion: 0
    },
    {
      id: '4',
      name: 'Q4 Year-End Release',
      date: '2024-12-31',
      status: 'planned',
      initiatives: 6,
      completion: 0
    }
  ]

  const themes = [
    {
      name: 'AI & Automation',
      initiatives: 8,
      impact: 'Very High',
      progress: 42,
      color: 'from-purple-500 to-pink-500',
      icon: <Zap className="w-5 h-5" />
    },
    {
      name: 'Mobile Experience',
      initiatives: 6,
      impact: 'High',
      progress: 35,
      color: 'from-blue-500 to-cyan-500',
      icon: <Target className="w-5 h-5" />
    },
    {
      name: 'Platform & API',
      initiatives: 12,
      impact: 'High',
      progress: 67,
      color: 'from-green-500 to-emerald-500',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      name: 'Security & Enterprise',
      initiatives: 10,
      impact: 'Critical',
      progress: 84,
      color: 'from-orange-500 to-red-500',
      icon: <Award className="w-5 h-5" />
    },
    {
      name: 'Collaboration',
      initiatives: 11,
      impact: 'Medium',
      progress: 28,
      color: 'from-yellow-500 to-amber-500',
      icon: <Users className="w-5 h-5" />
    }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Initiative completed', description: 'Enterprise SSO Integration shipped', time: '2 days ago', status: 'success' as const },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Progress update', description: 'AI Content Creation reached 65%', time: '1 week ago', status: 'success' as const },
    { icon: <Flag className="w-5 h-5" />, title: 'New initiative', description: 'Collaboration Features added to Q4', time: '2 weeks ago', status: 'info' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Milestone achieved', description: 'Q1 Product Launch completed', time: '1 month ago', status: 'success' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'planned': return 'bg-purple-100 text-purple-700'
      case 'on_track': return 'bg-green-100 text-green-700'
      case 'at_risk': return 'bg-yellow-100 text-yellow-700'
      case 'delayed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const maxProgress = Math.max(...themes.map(t => t.progress))

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

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Flag />} title="Initiatives" description="All items" onClick={() => console.log('Initiatives')} />
          <BentoQuickAction icon={<Calendar />} title="Timeline" description="Schedule" onClick={() => console.log('Timeline')} />
          <BentoQuickAction icon={<Target />} title="Themes" description="Strategic areas" onClick={() => console.log('Themes')} />
          <BentoQuickAction icon={<BarChart3 />} title="Reports" description="Analytics" onClick={() => console.log('Reports')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedQuarter === 'Q1' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q1')}>
            Q1 2024
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q2' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q2')}>
            Q2 2024
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q3' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q3')}>
            Q3 2024
          </PillButton>
          <PillButton variant={selectedQuarter === 'Q4' ? 'primary' : 'ghost'} onClick={() => setSelectedQuarter('Q4')}>
            Q4 2024
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Strategic Initiatives</h3>
              <div className="space-y-3">
                {initiatives.map((initiative) => (
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
                            <span className="px-2 py-1 rounded-md bg-muted">{initiative.quarter} 2024</span>
                            <span className="px-2 py-1 rounded-md bg-muted">{initiative.team}</span>
                          </div>
                        </div>
                        {initiative.status !== 'planned' && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-teal-600">{initiative.progress}%</p>
                            <p className="text-xs text-muted-foreground">Complete</p>
                          </div>
                        )}
                      </div>

                      {initiative.status !== 'planned' && (
                        <div className="space-y-1">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${initiative.color}`}
                              style={{ width: `${initiative.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t">
                        <div>
                          <p className="text-muted-foreground">Impact</p>
                          <p className={`font-semibold capitalize ${getImpactColor(initiative.impact)}`}>
                            {initiative.impact}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Effort</p>
                          <p className="font-semibold capitalize">{initiative.effort}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stakeholders</p>
                          <p className="font-semibold">{initiative.stakeholders.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <div className="flex flex-wrap gap-1">
                          {initiative.stakeholders.map((stakeholder) => (
                            <span key={stakeholder} className="text-xs px-2 py-1 rounded-md bg-muted">
                              {stakeholder}
                            </span>
                          ))}
                        </div>
                        <div className="ml-auto flex gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', initiative.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', initiative.id)}>
                            Edit
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Strategic Themes</h3>
              <div className="space-y-4">
                {themes.map((theme) => {
                  const progressPercent = (theme.progress / maxProgress) * 100

                  return (
                    <div key={theme.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${theme.color} flex items-center justify-center text-white`}>
                            {theme.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{theme.name}</p>
                            <p className="text-xs text-muted-foreground">{theme.initiatives} initiatives</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{theme.progress}%</p>
                          <p className="text-xs text-muted-foreground">{theme.impact} impact</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${theme.color} transition-all duration-300`}
                          style={{ width: `${theme.progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Key Milestones</h3>
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{milestone.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {milestone.date}
                          </span>
                          <span>{milestone.initiatives} initiatives</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{milestone.completion}%</p>
                      </div>
                    </div>
                    {milestone.completion > 0 && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-600 to-cyan-600"
                          style={{ width: `${milestone.completion}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Q2 Completion"
              current={58}
              goal={100}
              unit="%"
              icon={<Target className="w-5 h-5" />}
            />

            <ProgressCard
              title="Year Progress"
              current={42}
              goal={100}
              unit="%"
              icon={<Calendar className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Roadmap Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="On-Time Delivery" value="84%" change={15.3} />
                <MiniKPI label="Avg Cycle Time" value="6.2 weeks" change={-12.5} />
                <MiniKPI label="Stakeholder Alignment" value="92%" change={8.7} />
                <MiniKPI label="Resource Utilization" value="87%" change={5.2} />
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
