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
    <div className="space-y-12">
      {/* Luxury Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-thin text-slate-800 tracking-tight">
            Welcome back,
            <span className="block bg-gradient-to-r from-rose-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent font-extralight mt-1">
              John
            </span>
          </h1>
          <p className="text-xl text-slate-600 font-light mt-4 leading-relaxed">
            Your creative workspace is thriving. Here's today's overview.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 border border-white/20">
          <Plus className="w-5 h-5 mr-3" />
          New Project
        </Button>
      </div>

      {/* Luxury Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-emerald-700" />
              </div>
              <div className="flex items-center text-emerald-600 text-sm font-light">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{dashboardData.metrics.growth}%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-light text-slate-500 uppercase tracking-wider">Total Earnings</h3>
              <p className="text-3xl font-light text-slate-800 tracking-tight">
                {formatCurrency(dashboardData.metrics.totalEarnings)}
              </p>
              <p className="text-sm text-slate-600 font-light">
                {formatCurrency(dashboardData.metrics.monthlyEarnings)} this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-blue-700" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full text-xs font-light">
                Active
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-light text-slate-500 uppercase tracking-wider">Active Projects</h3>
              <p className="text-3xl font-light text-slate-800 tracking-tight">
                {dashboardData.metrics.activeProjects}
              </p>
              <p className="text-sm text-slate-600 font-light">
                {dashboardData.metrics.completedTasks} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-violet-700" />
              </div>
              <Badge className="bg-violet-100 text-violet-700 border-violet-200 px-3 py-1 rounded-full text-xs font-light">
                Growing
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-light text-slate-500 uppercase tracking-wider">Team & Clients</h3>
              <p className="text-3xl font-light text-slate-800 tracking-tight">
                {dashboardData.metrics.totalClients}
              </p>
              <p className="text-sm text-slate-600 font-light">
                {dashboardData.metrics.teamMembers} team members
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-700" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 rounded-full text-xs font-light">
                Pending
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-light text-slate-500 uppercase tracking-wider">Pending Payments</h3>
              <p className="text-3xl font-light text-slate-800 tracking-tight">
                {formatCurrency(dashboardData.metrics.pendingInvoices)}
              </p>
              <p className="text-sm text-slate-600 font-light">
                3 invoices outstanding
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Luxury Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5">
            <CardHeader className="p-8 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-light text-slate-800">Recent Projects</CardTitle>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all duration-300">
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <CardDescription className="text-slate-600 font-light">
                Track progress and manage your active creative projects
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                {dashboardData.recentProjects.map((project) => (
                  <div key={project.id} className="group p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-white/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-sm text-slate-600 font-light">{project.client}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={cn("px-3 py-1 text-xs font-light rounded-full", statusColors[project.status as keyof typeof statusColors])}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                        <span className="text-sm font-medium text-slate-800">
                          {formatCurrency(project.budget)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 font-light">Progress</span>
                        <span className="text-sm font-medium text-slate-800">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2 bg-slate-100" />
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 font-light">Due {formatDate(project.dueDate)}</span>
                        </div>
                        <div className="flex -space-x-2">
                          {project.team.map((member, index) => (
                            <Avatar key={index} className="w-8 h-8 border-2 border-white">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                                {member}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Tasks Sidebar */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xl font-light text-slate-800">Recent Activity</CardTitle>
              <CardDescription className="text-slate-600 font-light">
                Latest updates from your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => {
                  const IconComponent = activityIcons[activity.type as keyof typeof activityIcons]
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-light leading-relaxed">
                          {activity.message}
                        </p>
                        <p className="text-xs text-slate-500 font-light mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xl font-light text-slate-800">Upcoming Tasks</CardTitle>
              <CardDescription className="text-slate-600 font-light">
                Your focus for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {dashboardData.upcomingTasks.map((task) => (
                  <div key={task.id} className={cn("p-4 rounded-xl border-l-4 bg-white/50", priorityColors[task.priority as keyof typeof priorityColors])}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-800 mb-1">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-light mb-2">
                          {task.project}
                        </p>
                        <p className="text-xs text-slate-500 font-light">
                          Due: {task.dueDate}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs font-light">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 