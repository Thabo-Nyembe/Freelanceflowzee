'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Eye,
  Star,
  Zap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Plus
} from 'lucide-react'

// Framework7-inspired color palette
const framework7Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#1C1C1E'
}

// Mock analytics data
const analyticsData = {
  overview: {
    totalRevenue: 47850,
    revenueGrowth: 12.5,
    activeProjects: 8,
    projectsGrowth: 3,
    totalHours: 284,
    hoursGrowth: 8.3,
    clientSatisfaction: 4.8,
    satisfactionGrowth: 0.2
  },
  revenueChart: [
    { month: 'Jan', revenue: 15200, projects: 6 },
    { month: 'Feb', revenue: 18400, projects: 7 },
    { month: 'Mar', revenue: 22100, projects: 8 },
    { month: 'Apr', revenue: 19800, projects: 7 },
    { month: 'May', revenue: 25600, projects: 9 },
    { month: 'Jun', revenue: 28300, projects: 10 }
  ],
  topClients: [
    { name: 'TechCorp Solutions', revenue: 12500, projects: 3, growth: 15.2 },
    { name: 'Fashion Forward Inc.', revenue: 9800, projects: 2, growth: 8.7 },
    { name: 'Startup Ventures', revenue: 8200, projects: 2, growth: -2.1 },
    { name: 'Local Business Co.', revenue: 6500, projects: 1, growth: 22.4 }
  ],
  projectStats: [
    { status: 'Completed', count: 15, percentage: 62.5, color: 'bg-green-500' },
    { status: 'In Progress', count: 6, percentage: 25, color: 'bg-blue-500' },
    { status: 'Planning', count: 2, percentage: 8.3, color: 'bg-yellow-500' },
    { status: 'On Hold', count: 1, percentage: 4.2, color: 'bg-gray-500' }
  ],
  timeDistribution: [
    { category: 'Development', hours: 128, percentage: 45.1, color: 'bg-blue-500' },
    { category: 'Design', hours: 89, percentage: 31.3, color: 'bg-purple-500' },
    { category: 'Consultation', hours: 45, percentage: 15.8, color: 'bg-green-500' },
    { category: 'Meetings', hours: 22, percentage: 7.8, color: 'bg-orange-500' }
  ],
  recentActivities: [
    { type: 'project_completed', title: 'E-commerce Website', client: 'TechCorp', time: '2 hours ago', status: 'success' },
    { type: 'payment_received', title: 'Invoice #1024 Payment', client: 'Fashion Forward', time: '4 hours ago', status: 'success' },
    { type: 'project_started', title: 'Mobile App Design', client: 'Startup Ventures', time: '1 day ago', status: 'info' },
    { type: 'milestone_reached', title: 'Brand Identity Phase 2', client: 'Local Business', time: '2 days ago', status: 'success' }
  ]
}

export default function SmartAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const MetricCard = ({ title, value, change, icon: Icon, type = 'revenue' }: any) => {
    const isPositive = change >= 0
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
    const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50'
    
    return (
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform group-hover:scale-110 transition-transform duration-500" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${changeBg} ${changeColor} flex items-center`}>
              {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {Math.abs(change)}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
        </CardContent>
      </Card>
    )
  }

  const MiniChart = ({ data, title }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item.revenue))
    
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="flex items-end space-x-1 h-16">
          {data.slice(-6).map((item: any, index: number) => {
            const height = (item.revenue / maxValue) * 100
            return (
              <div key={index} className="flex-1 relative group">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-sm transition-all duration-300 group-hover:from-blue-700 group-hover:to-purple-700"
                  style={{ height: `${height}%` }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  ${item.revenue.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{data[data.length - 6]?.month}</span>
          <span>{data[data.length - 1]?.month}</span>
        </div>
      </Card>
    )
  }

  const ClientCard = ({ client, index }: any) => (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
              {client.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">{client.name}</h4>
            <p className="text-sm text-gray-600">{client.projects} projects</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">${client.revenue.toLocaleString()}</p>
          <div className={`text-xs flex items-center ${client.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {client.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(client.growth)}%
          </div>
        </div>
      </div>
    </Card>
  )

  const ActivityItem = ({ activity }: any) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'project_completed': return CheckCircle2
        case 'payment_received': return DollarSign
        case 'project_started': return Briefcase
        case 'milestone_reached': return Target
        default: return Activity
      }
    }
    
    const getActivityColor = (status: string) => {
      switch (status) {
        case 'success': return 'bg-green-500'
        case 'info': return 'bg-blue-500'
        case 'warning': return 'bg-yellow-500'
        default: return 'bg-gray-500'
      }
    }
    
    const Icon = getActivityIcon(activity.type)
    
    return (
      <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
        <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{activity.title}</h4>
          <p className="text-sm text-gray-600">{activity.client}</p>
        </div>
        <div className="text-sm text-gray-500">{activity.time}</div>
      </div>
    )
  }

  useEffect(() => {
    console.log("✅ Analytics Dashboard: Loaded successfully")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Analytics
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Comprehensive insights into your freelance business performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={refreshData}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
            change={analyticsData.overview.revenueGrowth}
            icon={DollarSign}
          />
          <MetricCard
            title="Active Projects"
            value={analyticsData.overview.activeProjects}
            change={analyticsData.overview.projectsGrowth}
            icon={Briefcase}
          />
          <MetricCard
            title="Hours Tracked"
            value={analyticsData.overview.totalHours}
            change={analyticsData.overview.hoursGrowth}
            icon={Clock}
          />
          <MetricCard
            title="Client Satisfaction"
            value={`${analyticsData.overview.clientSatisfaction}/5`}
            change={analyticsData.overview.satisfactionGrowth}
            icon={Star}
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Projects
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <MiniChart data={analyticsData.revenueChart} title="Revenue Trend (Last 6 Months)" />
              </div>
              
              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg. Project Value</span>
                    <span className="font-semibold">$5,981</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="font-semibold">$125</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Client Retention</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Project Success Rate</span>
                    <span className="font-semibold">96%</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Top Clients & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {analyticsData.topClients.map((client, index) => (
                    <ClientCard key={index} client={client} index={index} />
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <Button variant="ghost" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
                <div className="space-y-2">
                  {analyticsData.recentActivities.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { source: 'Web Development', amount: 28500, percentage: 59.6 },
                    { source: 'UI/UX Design', amount: 12300, percentage: 25.7 },
                    { source: 'Consulting', amount: 4800, percentage: 10.0 },
                    { source: 'Maintenance', amount: 2250, percentage: 4.7 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{item.source}</span>
                        <span className="font-semibold">${item.amount.toLocaleString()}</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goals</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Revenue Target</span>
                      <span className="font-semibold">$35,000</span>
                    </div>
                    <Progress value={81} className="h-3" />
                    <p className="text-sm text-gray-500 mt-1">$28,350 / $35,000</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">New Clients</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <Progress value={60} className="h-3" />
                    <p className="text-sm text-gray-500 mt-1">3 / 5 clients</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Project Completion</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <Progress value={75} className="h-3" />
                    <p className="text-sm text-gray-500 mt-1">6 / 8 projects</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
                <div className="space-y-4">
                  {analyticsData.projectStats.map((stat, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${stat.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-gray-700">{stat.status}</span>
                          <span className="font-semibold">{stat.count}</span>
                        </div>
                        <Progress value={stat.percentage} className="h-2 mt-1" />
                      </div>
                      <span className="text-sm text-gray-500">{stat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">On-time Delivery Rate</span>
                    <Badge className="bg-green-100 text-green-800">94%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Budget Adherence</span>
                    <Badge className="bg-blue-100 text-blue-800">89%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Client Satisfaction</span>
                    <Badge className="bg-yellow-100 text-yellow-800">4.8/5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Repeat Client Rate</span>
                    <Badge className="bg-purple-100 text-purple-800">73%</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Distribution</h3>
                <div className="space-y-4">
                  {analyticsData.timeDistribution.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{category.category}</span>
                        <span className="font-semibold">{category.hours}h</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                      <div className="text-sm text-gray-500">{category.percentage}% of total time</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <Zap className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Peak Performance</span>
                    </div>
                    <p className="text-green-700 text-sm">Tuesday 2-4 PM is your most productive time</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-800">Efficiency Score</span>
                    </div>
                    <p className="text-blue-700 text-sm">92% efficiency rate this month</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-semibold text-purple-800">Focus Time</span>
                    </div>
                    <p className="text-purple-700 text-sm">Average 3.2 hours of deep work daily</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 