"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  DollarSign,
  Users,
  FolderOpen,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  Plus,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for the dashboard
const dashboardData = {
  metrics: {
    totalEarnings: 47500,
    monthlyEarnings: 12500,
    growth: 15.2,
    pendingInvoices: 8750,
    activeProjects: 12,
    teamMembers: 15,
    completedTasks: 134,
    totalClients: 28
  },
  recentProjects: [
    {
      id: "1",
      title: "Brand Identity Overhaul",
      client: "TechCorp Inc.",
      progress: 85,
      status: "in-progress",
      dueDate: "2024-03-20",
      budget: 25000,
      team: ["JD", "AS", "BW"]
    },
    {
      id: "2", 
      title: "Mobile App Wireframes",
      client: "Innovate LLC",
      progress: 60,
      status: "review",
      dueDate: "2024-03-15",
      budget: 15000,
      team: ["JD", "MW"]
    },
    {
      id: "3",
      title: "Website Redesign",
      client: "StartupXYZ", 
      progress: 30,
      status: "planning",
      dueDate: "2024-04-01",
      budget: 18000,
      team: ["AS", "BW", "JW"]
    }
  ],
  recentActivity: [
    {
      id: "1",
      type: "feedback",
      message: "New feedback on Brand Identity project",
      time: "2 minutes ago",
      avatar: "TC"
    },
    {
      id: "2",
      type: "payment",
      message: "Payment received from Innovate LLC",
      time: "1 hour ago",
      avatar: "IL"
    },
    {
      id: "3",
      type: "project",
      message: "Mobile App Wireframes moved to review",
      time: "3 hours ago",
      avatar: "JD"
    },
    {
      id: "4",
      type: "team",
      message: "Alice Smith joined the team",
      time: "1 day ago",
      avatar: "AS"
    }
  ],
  upcomingTasks: [
    {
      id: "1",
      title: "Complete logo variations",
      project: "Brand Identity Overhaul",
      dueDate: "Today",
      priority: "high"
    },
    {
      id: "2",
      title: "Client presentation prep",
      project: "Mobile App Wireframes", 
      dueDate: "Tomorrow",
      priority: "medium"
    },
    {
      id: "3",
      title: "Review wireframes",
      project: "Website Redesign",
      dueDate: "Mar 18",
      priority: "low"
    }
  ]
}

const statusColors = {
  "in-progress": "bg-blue-100 text-blue-800",
  "review": "bg-yellow-100 text-yellow-800",
  "planning": "bg-gray-100 text-gray-800",
  "completed": "bg-green-100 text-green-800"
}

const priorityColors = {
  "high": "border-l-red-500",
  "medium": "border-l-yellow-500", 
  "low": "border-l-green-500"
}

const activityIcons = {
  feedback: MessageSquare,
  payment: DollarSign,
  project: FolderOpen,
  team: Users
}

export function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (dateString === "Today" || dateString === "Tomorrow") return dateString
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, John! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening with your creative workspace today.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(dashboardData.metrics.totalEarnings)}
                </p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{dashboardData.metrics.growth}% this month
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Projects</p>
                <p className="text-2xl font-bold text-blue-900">
                  {dashboardData.metrics.activeProjects}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  3 due this week
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Team Members</p>
                <p className="text-2xl font-bold text-purple-900">
                  {dashboardData.metrics.teamMembers}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  2 new this month
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(dashboardData.metrics.pendingInvoices)}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  4 invoices pending
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recent Projects</CardTitle>
                <Button variant="ghost" size="sm">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-slate-900">{project.title}</h4>
                      <Badge className={cn("text-xs", statusColors[project.status as keyof typeof statusColors])}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{project.client}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="flex -space-x-2">
                        {project.team.map((member, idx) => (
                          <Avatar key={idx} className="h-6 w-6 ring-2 ring-white">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {member}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-slate-500">{formatDate(project.dueDate)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.upcomingTasks.map((task) => (
                <div key={task.id} className={cn("p-3 border-l-4 bg-slate-50 rounded-r-lg", priorityColors[task.priority as keyof typeof priorityColors])}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900 text-sm">{task.title}</h5>
                      <p className="text-xs text-slate-600 mt-1">{task.project}</p>
                    </div>
                    <span className="text-xs text-slate-500">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type as keyof typeof activityIcons]
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{activity.message}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 