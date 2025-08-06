'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Target, 
  Award,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Activity,
  Zap,
  Eye,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Maximize2,
  MoreHorizontal
} from 'lucide-react'

export default function PerformanceAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')

  const performanceMetrics = {
    revenue: {
      current: 45231,
      previous: 38945,
      change: 16.1,
      trend: 'up'
    },
    projects: {
      completed: 24,
      inProgress: 8,
      total: 32,
      completionRate: 75,
      avgDuration: 18.5
    },
    clients: {
      total: 156,
      active: 89,
      new: 12,
      retention: 94.2,
      satisfaction: 4.8
    },
    productivity: {
      hoursLogged: 187,
      efficiency: 92,
      utilization: 78,
      billableHours: 145
    },
    financial: {
      profit: 28450,
      expenses: 16781,
      margin: 62.9,
      avgProjectValue: 1885
    }
  }

  const monthlyData = [
    { month: 'Jan', revenue: 32000, projects: 18, clients: 45, efficiency: 88 },
    { month: 'Feb', revenue: 35500, projects: 22, clients: 52, efficiency: 91 },
    { month: 'Mar', revenue: 38200, projects: 19, clients: 48, efficiency: 89 },
    { month: 'Apr', revenue: 42100, projects: 25, clients: 58, efficiency: 93 },
    { month: 'May', revenue: 39800, projects: 21, clients: 54, efficiency: 90 },
    { month: 'Jun', revenue: 45231, projects: 24, clients: 61, efficiency: 92 }
  ]

  const topPerformingProjects = [
    {
      id: 1,
      name: 'E-commerce Platform Redesign',
      client: 'TechCorp Inc',
      value: 8500,
      duration: 45,
      efficiency: 98,
      satisfaction: 5.0,
      status: 'completed'
    },
    {
      id: 2,
      name: 'Brand Identity Package',
      client: 'StartupXYZ',
      value: 3200,
      duration: 21,
      efficiency: 95,
      satisfaction: 4.9,
      status: 'completed'
    },
    {
      id: 3,
      name: 'Mobile App Development',
      client: 'InnovateLab',
      value: 12000,
      duration: 67,
      efficiency: 91,
      satisfaction: 4.8,
      status: 'in-progress'
    }
  ]

  const performanceGoals = [
    {
      id: 1,
      title: 'Monthly Revenue Target',
      target: 50000,
      current: 45231,
      progress: 90.5,
      status: 'on-track',
      deadline: '2024-01-31'
    },
    {
      id: 2,
      title: 'Client Satisfaction Score',
      target: 4.9,
      current: 4.8,
      progress: 98,
      status: 'on-track',
      deadline: '2024-01-31'
    },
    {
      id: 3,
      title: 'Project Completion Rate',
      target: 95,
      current: 75,
      progress: 79,
      status: 'behind',
      deadline: '2024-01-31'
    },
    {
      id: 4,
      title: 'Team Utilization',
      target: 85,
      current: 78,
      progress: 92,
      status: 'on-track',
      deadline: '2024-01-31'
    }
  ]

  const getChangeIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800'
      case 'behind': return 'bg-red-100 text-red-800'
      case 'ahead': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Performance Analytics
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track performance, analyze trends, and optimize your business
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${performanceMetrics.revenue.current.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getChangeIcon('up')}
                    <span className={`text-sm ml-1 ${getChangeColor(performanceMetrics.revenue.change)}`}>
                      +{performanceMetrics.revenue.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.projects.completed}</p>
                  <p className="text-sm text-blue-600">{performanceMetrics.projects.completionRate}% completion</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.clients.total}</p>
                  <p className="text-sm text-purple-600">{performanceMetrics.clients.retention}% retention</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.productivity.efficiency}%</p>
                  <p className="text-sm text-orange-600">{performanceMetrics.productivity.hoursLogged}h logged</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.clients.satisfaction}</p>
                  <p className="text-sm text-yellow-600">⭐ Excellent</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border border-white/30">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                      <p className="text-gray-600">Revenue chart visualization</p>
                      <p className="text-sm text-gray-500">Interactive chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Project Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-600">Project distribution chart</p>
                      <p className="text-sm text-gray-500">Interactive chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold text-green-600">${performanceMetrics.financial.profit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="font-semibold text-red-600">${performanceMetrics.financial.expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-semibold text-blue-600">{performanceMetrics.financial.margin}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Project Value</span>
                    <span className="font-semibold text-purple-600">${performanceMetrics.financial.avgProjectValue}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Productivity Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Team Efficiency</span>
                      <span className="font-medium">{performanceMetrics.productivity.efficiency}%</span>
                    </div>
                    <Progress value={performanceMetrics.productivity.efficiency} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilization Rate</span>
                      <span className="font-medium">{performanceMetrics.productivity.utilization}%</span>
                    </div>
                    <Progress value={performanceMetrics.productivity.utilization} className="h-2" />
                  </div>
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hours Logged</span>
                      <span className="font-medium">{performanceMetrics.productivity.hoursLogged}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Billable Hours</span>
                      <span className="font-medium">{performanceMetrics.productivity.billableHours}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Client Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Clients</span>
                    <span className="font-semibold text-blue-600">{performanceMetrics.clients.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Clients</span>
                    <span className="font-semibold text-green-600">{performanceMetrics.clients.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New This Month</span>
                    <span className="font-semibold text-purple-600">{performanceMetrics.clients.new}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Retention Rate</span>
                      <span className="font-medium">{performanceMetrics.clients.retention}%</span>
                    </div>
                    <Progress value={performanceMetrics.clients.retention} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPerformingProjects.map((project, index) => (
                  <div key={project.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                      </div>
                      <Badge className={project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Value</p>
                        <p className="font-semibold text-green-600">${project.value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{project.duration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className="font-semibold text-blue-600">{project.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Satisfaction</p>
                        <p className="font-semibold text-yellow-600">⭐ {project.satisfaction}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {performanceGoals.map((goal) => (
                <Card key={goal.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Target</span>
                      <span className="font-semibold">
                        {typeof goal.target === 'number' && goal.target > 100 
                          ? `$${goal.target.toLocaleString()}` 
                          : goal.target}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current</span>
                      <span className="font-semibold text-blue-600">
                        {typeof goal.current === 'number' && goal.current > 100 
                          ? `$${goal.current.toLocaleString()}` 
                          : goal.current}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-3" />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Deadline</span>
                      <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Trend Analysis</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Comprehensive trend analysis charts and insights would be displayed here with interactive visualizations.
                    </p>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}