"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  RankingList,
  ProgressCard,
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
  Search,
  Star,
  TrendingUp,
  Award,
  Target,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react'

/**
 * Team Management V2 - Groundbreaking Team Collaboration
 * Showcases team performance with modern components
 */
export default function TeamManagementV2() {
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'projects'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Team Size', value: '24', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Projects', value: '18', change: 8.3, icon: <Target className="w-5 h-5" /> },
    { label: 'Avg Performance', value: '92%', change: 5.7, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Team Satisfaction', value: '4.8', change: 2.1, icon: <Star className="w-5 h-5" /> }
  ]

  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Lead Designer',
      performance: 96,
      tasksCompleted: 127,
      rating: 4.9,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Senior Developer',
      performance: 94,
      tasksCompleted: 145,
      rating: 4.8,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Project Manager',
      performance: 92,
      tasksCompleted: 98,
      rating: 4.7,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'UX Designer',
      performance: 89,
      tasksCompleted: 87,
      rating: 4.6,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK'
    }
  ]

  const topPerformers = teamMembers
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5)
    .map((member, index) => ({
      rank: index + 1,
      name: member.name,
      avatar: member.avatar,
      value: `${member.performance}%`,
      change: member.performance - 85
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-cyan-600" />
              Team Management
            </h1>
            <p className="text-muted-foreground">Manage your team and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" onClick={() => console.log('Settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </ModernButton>
            <GradientButton from="cyan" to="blue" onClick={() => console.log('Add member')}>
              <Plus className="w-5 h-5 mr-2" />
              Add Member
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Add Member" description="Invite" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Calendar />} title="Schedule" description="Meetings" onClick={() => console.log('Schedule')} />
          <BentoQuickAction icon={<MessageSquare />} title="Messages" description="Team chat" onClick={() => console.log('Messages')} />
          <BentoQuickAction icon={<BarChart3 />} title="Reports" description="Analytics" onClick={() => console.log('Reports')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedView === 'overview' ? 'primary' : 'ghost'} onClick={() => setSelectedView('overview')}>
            Overview
          </PillButton>
          <PillButton variant={selectedView === 'performance' ? 'primary' : 'ghost'} onClick={() => setSelectedView('performance')}>
            Performance
          </PillButton>
          <PillButton variant={selectedView === 'projects' ? 'primary' : 'ghost'} onClick={() => setSelectedView('projects')}>
            Projects
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Team Members</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{member.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="font-semibold">{member.performance}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-600 to-blue-600"
                              style={{ width: `${member.performance}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{member.tasksCompleted} tasks completed</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', member.id)}>
                          View Profile
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Message', member.id)}>
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Performers" items={topPerformers} />
            <ProgressCard
              title="Team Performance Goal"
              current={92}
              goal={95}
              unit="%"
              icon={<Target className="w-5 h-5" />}
            />
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Tasks/Member" value="114" change={12.5} />
                <MiniKPI label="Collaboration Score" value="88%" change={8.3} />
                <MiniKPI label="On-Time Delivery" value="96%" change={5.7} />
                <MiniKPI label="Team Velocity" value="142" change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
