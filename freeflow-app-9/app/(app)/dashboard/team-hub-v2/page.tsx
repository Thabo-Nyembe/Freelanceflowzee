"use client"

import { useState } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  RankingList,
  ActivityFeed,
  ProgressCard,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Clock,
  Settings,
  BarChart3,
  CheckCircle2,
  Star
} from 'lucide-react'

/**
 * Team Hub V2 - Groundbreaking Team Management
 * Showcases team collaboration with modern components
 */
export default function TeamHubV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'leads'>('all')

  // Sample team data
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      projectsCount: 12,
      tasksCompleted: 45,
      performance: 95,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Lead Developer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      projectsCount: 15,
      tasksCompleted: 52,
      performance: 92,
      status: 'active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Project Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      projectsCount: 18,
      tasksCompleted: 48,
      performance: 88,
      status: 'active'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Marketing Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      projectsCount: 8,
      tasksCompleted: 32,
      performance: 85,
      status: 'active'
    }
  ]

  // Stats
  const stats = [
    {
      label: 'Team Members',
      value: '23',
      change: 8.3,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Active Projects',
      value: '34',
      change: 12.5,
      icon: <Target className="w-5 h-5" />
    },
    {
      label: 'Tasks Completed',
      value: '156',
      change: 15.2,
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      label: 'Team Performance',
      value: '92%',
      change: 5.7,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  // Top performers
  const topPerformers = teamMembers
    .sort((a, b) => b.performance - a.performance)
    .map((member, index) => ({
      rank: index + 1,
      name: member.name,
      avatar: member.avatar,
      value: `${member.performance}%`,
      change: member.performance - 80
    }))

  // Recent activity
  const recentActivity = [
    {
      icon: <UserPlus className="w-5 h-5" />,
      title: 'New team member',
      description: 'Alex Martinez joined the team',
      time: '2 hours ago',
      status: 'success' as const
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Task completed',
      description: 'Sarah completed Website Redesign',
      time: '4 hours ago',
      status: 'success' as const
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Team meeting scheduled',
      description: 'Weekly standup tomorrow at 10 AM',
      time: '5 hours ago',
      status: 'info' as const
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Achievement unlocked',
      description: 'Michael earned Top Performer badge',
      time: '1 day ago',
      status: 'success' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:from-green-950 dark:via-emerald-950/30 dark:to-teal-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-green-600" />
              Team Hub
            </h1>
            <p className="text-muted-foreground">
              Collaborate and manage your team effectively
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Mail />}
              ariaLabel="Messages"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="green"
              to="emerald"
              onClick={() => console.log('Invite member')}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Member
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              All Members
            </PillButton>
            <PillButton
              variant={selectedFilter === 'active' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('active')}
            >
              Active
            </PillButton>
            <PillButton
              variant={selectedFilter === 'leads' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('leads')}
            >
              Team Leads
            </PillButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="lg:col-span-2 space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {member.projectsCount} projects
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {member.tasksCompleted} tasks
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="font-semibold">{member.performance}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
                              style={{ width: `${member.performance}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <ModernButton
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => console.log('Message', member.id)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </ModernButton>
                      <ModernButton
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => console.log('View', member.id)}
                      >
                        View Profile
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BentoQuickAction
                icon={<Calendar className="w-6 h-6" />}
                title="Schedule"
                description="Team calendar"
                onClick={() => console.log('Schedule')}
              />
              <BentoQuickAction
                icon={<MessageSquare className="w-6 h-6" />}
                title="Messages"
                description="Team chat"
                onClick={() => console.log('Messages')}
              />
              <BentoQuickAction
                icon={<BarChart3 className="w-6 h-6" />}
                title="Reports"
                description="Team metrics"
                onClick={() => console.log('Reports')}
              />
              <BentoQuickAction
                icon={<Award className="w-6 h-6" />}
                title="Rewards"
                description="Recognition"
                onClick={() => console.log('Rewards')}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            <RankingList
              title="🏆 Top Performers"
              items={topPerformers}
            />

            {/* Team Progress */}
            <ProgressCard
              title="Team Goals"
              current={85}
              goal={100}
              unit="%"
              icon={<Target className="w-5 h-5" />}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Response Time" value="2.4h" change={-15.2} />
                <MiniKPI label="Team Satisfaction" value="94%" change={5.7} />
                <MiniKPI label="Collaboration Score" value="88%" change={8.3} />
                <MiniKPI label="Active Hours" value="42h/wk" change={2.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
