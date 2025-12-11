"use client"

import { useState } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoChart,
  BentoList,
  BentoProgress
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  RankingList,
  ActivityFeed,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Briefcase,
  Eye,
  Edit,
  Clock,
  Target,
  BarChart3,
  Settings,
  ArrowUpRight
} from 'lucide-react'

/**
 * Projects Hub V2 - Groundbreaking Project Management
 * Showcases project tracking with modern components
 */
export default function ProjectsHubV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample project data
  const projects = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete overhaul of company website',
      client: 'Acme Corp',
      budget: 45000,
      progress: 75,
      status: 'active',
      priority: 'high',
      dueDate: '2025-01-15',
      teamMembers: 5,
      comments: 12
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'iOS and Android app for e-commerce',
      client: 'TechStart Inc',
      budget: 85000,
      progress: 45,
      status: 'active',
      priority: 'urgent',
      dueDate: '2025-02-01',
      teamMembers: 8,
      comments: 24
    },
    {
      id: '3',
      title: 'Brand Identity Package',
      description: 'Logo, colors, and brand guidelines',
      client: 'GreenLeaf Co',
      budget: 12000,
      progress: 100,
      status: 'completed',
      priority: 'medium',
      dueDate: '2024-12-30',
      teamMembers: 3,
      comments: 8
    },
    {
      id: '4',
      title: 'Marketing Campaign',
      description: 'Q1 digital marketing strategy',
      client: 'FinanceHub',
      budget: 28000,
      progress: 30,
      status: 'active',
      priority: 'high',
      dueDate: '2025-03-15',
      teamMembers: 6,
      comments: 15
    }
  ]

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalTeamMembers = [...new Set(projects.flatMap(() => Array.from({ length: 5 })))].length

  // KPI Stats
  const stats = [
    {
      label: 'Total Projects',
      value: projects.length.toString(),
      change: 12.5,
      icon: <FolderOpen className="w-5 h-5" />
    },
    {
      label: 'Active Projects',
      value: activeProjects.length.toString(),
      change: 8.3,
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      label: 'Total Revenue',
      value: `$${(totalBudget / 1000).toFixed(0)}K`,
      change: 15.2,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Team Members',
      value: '23',
      change: 5.0,
      icon: <Users className="w-5 h-5" />
    }
  ]

  // Top projects by budget
  const topProjects = projects
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 5)
    .map((project, index) => ({
      rank: index + 1,
      name: project.title,
      value: `$${(project.budget / 1000).toFixed(1)}K`,
      avatar: undefined,
      change: project.progress - 50
    }))

  // Recent activity
  const recentActivity = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Project milestone completed',
      description: 'Brand Identity Package delivered',
      time: '2 hours ago',
      status: 'success' as const
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'New team member added',
      description: 'Sarah joined Mobile App Development',
      time: '5 hours ago',
      status: 'info' as const
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: 'Budget updated',
      description: 'Marketing Campaign budget increased',
      time: '1 day ago',
      status: 'info' as const
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Deadline approaching',
      description: 'Website Redesign due in 10 days',
      time: '1 day ago',
      status: 'warning' as const
    }
  ]

  // Project list items
  const projectListItems = projects.map(project => ({
    icon: <FolderOpen className="w-4 h-4" />,
    title: project.title,
    subtitle: project.client,
    value: `${project.progress}%`
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-blue-500'
      case 'low': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:from-blue-950 dark:via-indigo-950/30 dark:to-purple-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-blue-600" />
              Projects Hub
            </h1>
            <p className="text-muted-foreground">
              Manage and track all your projects in one place
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Filter />}
              ariaLabel="Filter"
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
              from="blue"
              to="indigo"
              onClick={() => console.log('New project')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </GradientButton>
          </div>
        </div>

        {/* KPI Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              All Projects
            </PillButton>
            <PillButton
              variant={selectedFilter === 'active' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('active')}
            >
              Active
            </PillButton>
            <PillButton
              variant={selectedFilter === 'completed' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('completed')}
            >
              Completed
            </PillButton>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-6">
            {projects.map((project) => (
              <BentoCard key={project.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-md border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${getPriorityDot(project.priority)}`} />
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{project.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Client</p>
                        <p className="font-medium">{project.client}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-medium">${project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-semibold">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.teamMembers} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.comments} comments
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('View', project.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </ModernButton>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Edit', project.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </ModernButton>
                        {project.status === 'active' && (
                          <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => console.log('Complete', project.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <BentoProgress
              title="Project Metrics"
              items={[
                {
                  label: 'Overall Completion',
                  value: Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length),
                  total: 100,
                  color: 'bg-blue-600'
                },
                {
                  label: 'Active Projects',
                  value: activeProjects.length,
                  total: projects.length,
                  color: 'bg-green-600'
                },
                {
                  label: 'Budget Utilization',
                  value: 142000,
                  total: totalBudget,
                  color: 'bg-violet-600'
                }
              ]}
            />

            {/* Top Projects */}
            <RankingList
              title="📊 Top Projects by Budget"
              items={topProjects}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    On Track
                  </div>
                  <div className="font-semibold">{activeProjects.filter(p => p.progress >= 50).length}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Due This Week
                  </div>
                  <div className="font-semibold">2</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Avg. Progress
                  </div>
                  <div className="font-semibold">
                    {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComparisonCard
            title="Project Status Comparison"
            leftLabel="Active"
            leftValue={activeProjects.length.toString()}
            rightLabel="Completed"
            rightValue={completedProjects.length.toString()}
            icon={<Briefcase className="w-5 h-5" />}
          />

          <ComparisonCard
            title="Budget Comparison"
            leftLabel="This Quarter"
            leftValue={`$${(totalBudget / 1000).toFixed(0)}K`}
            rightLabel="Last Quarter"
            rightValue="$145K"
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>

        {/* Charts Section */}
        <BentoGrid columns={2} gap="md">
          <BentoChart
            title="Project Timeline"
            subtitle="Monthly project completion trend"
            action={
              <ModernButton variant="ghost" size="sm">
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </ModernButton>
            }
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <BarChart3 className="w-16 h-16 mx-auto text-blue-600" />
                <p className="text-muted-foreground">Chart visualization ready</p>
                <div className="flex gap-4 justify-center text-sm">
                  <div>
                    <div className="font-bold text-blue-600">12</div>
                    <div className="text-muted-foreground">This Month</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">8</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </BentoChart>

          <BentoList
            title="Recent Projects"
            items={projectListItems}
          />
        </BentoGrid>
      </div>
    </div>
  )
}
