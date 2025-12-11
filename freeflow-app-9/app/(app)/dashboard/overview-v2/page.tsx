"use client"

import { useState } from 'react'
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

/**
 * Dashboard Overview V2 - Groundbreaking 2025 Design
 * Showcases all new components with bento grid layout
 */
export default function DashboardOverviewV2() {
  const [isLoading, setIsLoading] = useState(false)

  // Sample data
  const stats = {
    revenue: { value: "$124,567", change: 12.5 },
    clients: { value: "127", change: 8.3 },
    projects: { value: "34", change: 5.2 },
    satisfaction: { value: "98%", change: 2.1 }
  }

  const recentProjects = [
    {
      icon: <FolderOpen className="w-4 h-4" />,
      title: "Website Redesign",
      subtitle: "Client: Acme Corp",
      value: "$12,500"
    },
    {
      icon: <FolderOpen className="w-4 h-4" />,
      title: "Brand Identity",
      subtitle: "Client: TechStart Inc",
      value: "$8,200"
    },
    {
      icon: <FolderOpen className="w-4 h-4" />,
      title: "Mobile App UI",
      subtitle: "Client: FinanceHub",
      value: "$15,750"
    },
    {
      icon: <FolderOpen className="w-4 h-4" />,
      title: "Marketing Campaign",
      subtitle: "Client: GreenLeaf",
      value: "$6,800"
    }
  ]

  const recentActivity = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Project milestone completed",
      description: "Website Redesign - Phase 2",
      time: "2 hours ago",
      status: "success" as const
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "New client onboarded",
      description: "TechStart Inc joined your workspace",
      time: "5 hours ago",
      status: "info" as const
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Payment received",
      description: "$12,500 from Acme Corp",
      time: "1 day ago",
      status: "success" as const
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "New message from client",
      description: "FinanceHub left a comment",
      time: "2 days ago",
      status: "info" as const
    }
  ]

  const topPerformers = [
    {
      rank: 1,
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      value: "$45.2K",
      change: 12
    },
    {
      rank: 2,
      name: "Michael Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      value: "$38.9K",
      change: 8
    },
    {
      rank: 3,
      name: "Emily Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      value: "$32.4K",
      change: 15
    },
    {
      rank: 4,
      name: "David Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      value: "$28.1K",
      change: -2
    }
  ]

  const progressItems = [
    { label: "Monthly Revenue Goal", value: 87500, total: 100000, color: "bg-violet-600" },
    { label: "Projects Delivered", value: 28, total: 35, color: "bg-green-600" },
    { label: "Client Satisfaction", value: 98, total: 100, color: "bg-blue-600" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 dark:from-slate-950 dark:via-rose-950/30 dark:to-violet-950/40 p-6">
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
              onClick={() => console.log("New project")}
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
            title="🚀 Ready to Scale?"
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
            trend="up"
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
              {/* Placeholder for chart */}
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-violet-600" />
                <p>Chart component integration ready</p>
              </div>
            </div>
          </BentoChart>

          <BentoList
            title="Recent Projects"
            items={recentProjects}
          />
        </BentoGrid>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BentoQuickAction
            icon={<Zap className="w-6 h-6" />}
            title="AI Create"
            description="Generate content with AI"
            onClick={() => console.log("AI Create")}
          />

          <BentoQuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Schedule Meeting"
            description="Book time with clients"
            onClick={() => console.log("Schedule")}
          />

          <BentoQuickAction
            icon={<Target className="w-6 h-6" />}
            title="View Goals"
            description="Track your progress"
            onClick={() => console.log("Goals")}
          />

          <BentoQuickAction
            icon={<MessageSquare className="w-6 h-6" />}
            title="Messages"
            description="Check client messages"
            onClick={() => console.log("Messages")}
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
          title="🏆 Top Performers This Month"
          items={topPerformers}
        />
      </div>
    </div>
  )
}
