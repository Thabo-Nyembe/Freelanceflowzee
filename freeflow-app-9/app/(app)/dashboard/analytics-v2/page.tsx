"use client"

import {
  KPICard,
  StatGrid,
  ProgressCard,
  CircularProgress,
  ComparisonCard,
  RankingList,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  BentoGrid,
  BentoCard,
  BentoChart
} from '@/components/ui/bento-grid-advanced'
import {
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
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  BarChart2,
  PieChart,
  Activity
} from 'lucide-react'

/**
 * Analytics V2 - Groundbreaking Data Visualization
 * Showcases all results display components
 */
export default function AnalyticsV2() {
  // Sample data
  const kpiStats = [
    {
      label: "Total Revenue",
      value: "$124.5K",
      change: 12.5,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: "Active Projects",
      value: "34",
      change: 5.2,
      icon: <FolderOpen className="w-5 h-5" />
    },
    {
      label: "Client Satisfaction",
      value: "98%",
      change: 2.1,
      icon: <Star className="w-5 h-5" />
    },
    {
      label: "Task Completion",
      value: "87%",
      change: -3.2,
      icon: <Activity className="w-5 h-5" />
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
    },
    {
      rank: 5,
      name: "Lisa Anderson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      value: "$24.7K",
      change: 6
    }
  ]

  const recentActivity = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Large payment received",
      description: "$15,000 from Enterprise Client",
      time: "2 hours ago",
      status: "success" as const
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "New team member added",
      description: "Alex Martinez joined your team",
      time: "5 hours ago",
      status: "info" as const
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Milestone achieved",
      description: "Monthly revenue goal reached",
      time: "1 day ago",
      status: "success" as const
    },
    {
      icon: <FolderOpen className="w-5 h-5" />,
      title: "Project completed",
      description: "Website Redesign delivered",
      time: "2 days ago",
      status: "success" as const
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "5-star review received",
      description: "Client left positive feedback",
      time: "3 days ago",
      status: "success" as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-violet-50/40 dark:from-blue-950 dark:via-indigo-950/30 dark:to-violet-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart2 className="w-10 h-10 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your business performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PillButton variant="ghost">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </PillButton>
            <IconButton
              icon={<Filter />}
              ariaLabel="Filter"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<RefreshCw />}
              ariaLabel="Refresh"
              variant="ghost"
              size="md"
            />
            <ModernButton
              variant="primary"
              icon={<Download className="w-4 h-4" />}
            >
              Export Report
            </ModernButton>
          </div>
        </div>

        {/* KPI Overview */}
        <StatGrid columns={4} stats={kpiStats} />

        {/* Progress Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProgressCard
            title="Monthly Revenue Goal"
            current={124500}
            goal={150000}
            unit="$"
            icon={<Target className="w-5 h-5" />}
          />

          <ProgressCard
            title="Projects Delivered"
            current={28}
            goal={35}
            icon={<FolderOpen className="w-5 h-5" />}
          />

          <ProgressCard
            title="Client Acquisition"
            current={127}
            goal={150}
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* Circular Progress Metrics */}
        <BentoCard className="p-8">
          <h3 className="text-2xl font-bold mb-8">Key Metrics Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <CircularProgress
                value={87}
                max={100}
                size={140}
                strokeWidth={12}
                label="Revenue"
              />
              <p className="mt-4 text-sm text-muted-foreground">Monthly Target</p>
            </div>

            <div className="flex flex-col items-center">
              <CircularProgress
                value={98}
                max={100}
                size={140}
                strokeWidth={12}
                label="Satisfaction"
              />
              <p className="mt-4 text-sm text-muted-foreground">Client Rating</p>
            </div>

            <div className="flex flex-col items-center">
              <CircularProgress
                value={80}
                max={100}
                size={140}
                strokeWidth={12}
                label="Projects"
              />
              <p className="mt-4 text-sm text-muted-foreground">Completion Rate</p>
            </div>

            <div className="flex flex-col items-center">
              <CircularProgress
                value={92}
                max={100}
                size={140}
                strokeWidth={12}
                label="Quality"
              />
              <p className="mt-4 text-sm text-muted-foreground">Work Quality</p>
            </div>
          </div>
        </BentoCard>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComparisonCard
            title="Revenue Comparison"
            leftLabel="This Month"
            leftValue="$124.5K"
            rightLabel="Last Month"
            rightValue="$110.8K"
            icon={<DollarSign className="w-5 h-5" />}
          />

          <ComparisonCard
            title="Project Comparison"
            leftLabel="Completed"
            leftValue="28"
            rightLabel="In Progress"
            rightValue="6"
            icon={<FolderOpen className="w-5 h-5" />}
          />
        </div>

        {/* Charts */}
        <BentoGrid columns={2} gap="md">
          <BentoChart
            title="Revenue Trend"
            subtitle="Monthly performance over time"
            action={
              <ModernButton variant="ghost" size="sm">
                View Details
              </ModernButton>
            }
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <TrendingUp className="w-16 h-16 mx-auto text-blue-600" />
                <p className="text-muted-foreground">Chart visualization ready</p>
                <MiniKPI label="Average Growth" value="+12.5%" change={2.3} />
              </div>
            </div>
          </BentoChart>

          <BentoChart
            title="Client Distribution"
            subtitle="Breakdown by category"
            action={
              <ModernButton variant="ghost" size="sm">
                Export Data
              </ModernButton>
            }
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <PieChart className="w-16 h-16 mx-auto text-violet-600" />
                <p className="text-muted-foreground">Chart visualization ready</p>
                <div className="flex gap-4 justify-center">
                  <MiniKPI label="Enterprise" value="45%" />
                  <MiniKPI label="SMB" value="35%" />
                  <MiniKPI label="Startup" value="20%" />
                </div>
              </div>
            </div>
          </BentoChart>
        </BentoGrid>

        {/* Leaderboard and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingList
            title="🏆 Top Performers This Month"
            items={topPerformers}
          />

          <ActivityFeed
            title="Recent Activity"
            activities={recentActivity}
          />
        </div>

        {/* Mini KPIs Grid */}
        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MiniKPI label="Avg. Project Value" value="$3.2K" change={8.5} />
            <MiniKPI label="Client Retention" value="94%" change={3.2} />
            <MiniKPI label="Team Utilization" value="87%" change={-2.1} />
            <MiniKPI label="Response Time" value="2.4h" change={-15} />
          </div>
        </BentoCard>
      </div>
    </div>
  )
}
