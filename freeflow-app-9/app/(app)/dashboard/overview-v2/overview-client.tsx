'use client'

import { useState, useEffect } from 'react'
import {
  BentoGrid,
  BentoHero,
  BentoStat,
  BentoChart,
  BentoList,
  BentoQuickAction,
  BentoProgress
} from '@/components/ui/bento-grid-advanced'
import {
  KPICard,
  StatGrid,
  ActivityFeed,
  RankingList
} from '@/components/ui/results-display'
import {
  GradientButton,
  ModernButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  DollarSign,
  Users,
  FolderOpen,
  TrendingUp,
  Star,
  Clock,
  Zap,
  Target,
  Plus,
  Settings,
  Bell,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { useDashboardWidgets, DashboardWidget } from '@/lib/hooks/use-dashboard-widgets'
import { useProjects } from '@/lib/hooks/use-projects'

interface TeamPerformanceItem {
  id: string
  member_name: string
  member_avatar?: string
  revenue: number
  change_percent: number
  rank: number
}

interface OverviewClientProps {
  initialWidgets: DashboardWidget[]
  initialStats: {
    revenue: { value: string; change: number }
    clients: { value: string; change: number }
    projects: { value: string; change: number }
    satisfaction: { value: string; change: number }
  }
  initialProjects: any[]
  initialActivity: any[]
  initialTeamPerformance?: TeamPerformanceItem[]
}

export default function OverviewClient({
  initialWidgets,
  initialStats,
  initialProjects,
  initialActivity,
  initialTeamPerformance = []
}: OverviewClientProps) {
  const { widgets, fetchWidgets } = useDashboardWidgets(initialWidgets)
  const { projects, stats: projectStats, fetchProjects } = useProjects(initialProjects)

  useEffect(() => {
    fetchWidgets()
    fetchProjects()
  }, [fetchWidgets, fetchProjects])

  const stats = {
    revenue: initialStats.revenue || { value: "$0", change: 0 },
    clients: initialStats.clients || { value: "0", change: 0 },
    projects: { value: String(projectStats.total || initialStats.projects?.value || 0), change: initialStats.projects?.change || 0 },
    satisfaction: initialStats.satisfaction || { value: "0%", change: 0 }
  }

  const recentProjects = projects.slice(0, 4).map(p => ({
    icon: <FolderOpen className="w-4 h-4" />,
    title: p.name,
    subtitle: `Progress: ${p.progress}%`,
    value: p.budget ? `$${p.budget.toLocaleString()}` : 'No budget'
  }))

  // Default recent projects if none exist
  const displayProjects = recentProjects.length > 0 ? recentProjects : [
    { icon: <FolderOpen className="w-4 h-4" />, title: "No projects yet", subtitle: "Create your first project", value: "$0" }
  ]

  const recentActivity = initialActivity.length > 0 ? initialActivity : [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Welcome to Kazi!",
      description: "Start by creating your first project",
      time: "Just now",
      status: "info" as const
    }
  ]

  // Use real team performance data from database, with fallback to empty state
  const topPerformers = initialTeamPerformance.length > 0
    ? initialTeamPerformance.map(member => ({
        rank: member.rank,
        name: member.member_name,
        avatar: member.member_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.member_name}`,
        value: `$${(member.revenue / 1000).toFixed(1)}K`,
        change: member.change_percent
      }))
    : [] // Empty state - no mock data

  const progressItems = [
    { label: "Monthly Revenue Goal", value: 87500, total: 100000, color: "bg-violet-600" },
    { label: "Projects Delivered", value: projectStats.completed || 0, total: projectStats.total || 1, color: "bg-green-600" },
    { label: "Client Satisfaction", value: 98, total: 100, color: "bg-blue-600" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Bell />}
              ariaLabel="Notifications"
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
              from="violet"
              to="purple"
              onClick={() => window.location.href = '/dashboard/projects-hub-v2'}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </GradientButton>
          </div>
        </div>

        {/* Main Bento Grid */}
        <BentoGrid columns={3} gap="md">
          {/* Hero Section */}
          <BentoHero
            title="Ready to Scale?"
            description="Your business is growing! Let's keep the momentum going with smart insights and powerful tools."
            action={
              <ModernButton
                variant="primary"
                size="lg"
                icon={<ArrowRight />}
                iconPosition="right"
              >
                View Insights
              </ModernButton>
            }
            gradient="violet"
          />

          {/* KPI Stats */}
          <BentoStat
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Revenue"
            value={stats.revenue.value}
            trend="up"
            trendValue={`+${stats.revenue.change}%`}
          />

          <BentoStat
            icon={<Users className="w-5 h-5" />}
            label="Active Clients"
            value={stats.clients.value}
            trend="up"
            trendValue={`+${stats.clients.change}%`}
          />

          <BentoStat
            icon={<FolderOpen className="w-5 h-5" />}
            label="Active Projects"
            value={stats.projects.value}
            trend={projectStats.active > 0 ? "up" : "neutral"}
            trendValue={`+${stats.projects.change}%`}
          />

          <BentoStat
            icon={<Star className="w-5 h-5" />}
            label="Satisfaction Rate"
            value={stats.satisfaction.value}
            trend="up"
            trendValue={`+${stats.satisfaction.change}%`}
          />
        </BentoGrid>

        {/* Charts and Lists */}
        <BentoGrid columns={2} gap="md">
          <BentoChart
            title="Revenue Trend"
            subtitle="Last 30 days performance"
            action={
              <ModernButton variant="ghost" size="sm">
                View Details
              </ModernButton>
            }
          >
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-violet-600" />
                <p>Chart component integration ready</p>
              </div>
            </div>
          </BentoChart>

          <BentoList
            title="Recent Projects"
            items={displayProjects}
          />
        </BentoGrid>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BentoQuickAction
            icon={<Zap className="w-6 h-6" />}
            title="AI Create"
            description="Generate content with AI"
            onClick={() => window.location.href = '/dashboard/ai-create-v2'}
          />

          <BentoQuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Schedule Meeting"
            description="Book time with clients"
            onClick={() => window.location.href = '/dashboard/calendar-v2'}
          />

          <BentoQuickAction
            icon={<Target className="w-6 h-6" />}
            title="View Goals"
            description="Track your progress"
            onClick={() => window.location.href = '/dashboard/my-day-v2'}
          />

          <BentoQuickAction
            icon={<MessageSquare className="w-6 h-6" />}
            title="Messages"
            description="Check client messages"
            onClick={() => window.location.href = '/dashboard/messages-v2'}
          />
        </div>

        {/* Progress and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BentoProgress
            title="Goals Progress"
            items={progressItems}
          />

          <ActivityFeed
            title="Recent Activity"
            activities={recentActivity}
            className="lg:col-span-2"
          />
        </div>

        {/* Leaderboard */}
        <RankingList
          title="Top Performers This Month"
          items={topPerformers}
        />
      </div>
    </div>
  )
}
