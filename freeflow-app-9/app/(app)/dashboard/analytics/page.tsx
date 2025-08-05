'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FolderOpen, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointer,
  Download,
  Share
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    change: number
  }
  projects: {
    total: number
    active: number
    completed: number
    cancelled: number
  }
  clients: {
    total: number
    new: number
    returning: number
  }
  time: {
    totalHours: number
    billableHours: number
    efficiency: number
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    revenue: {
      current: 45231,
      previous: 38920,
      change: 16.2
    },
    projects: {
      total: 68,
      active: 12,
      completed: 48,
      cancelled: 8
    },
    clients: {
      total: 156,
      new: 23,
      returning: 133
    },
    time: {
      totalHours: 1247,
      billableHours: 1089,
      efficiency: 87.3
    }
  }

  const monthlyRevenue = [
    { month: 'Jan', revenue: 32000, projects: 8 },
    { month: 'Feb', revenue: 35000, projects: 10 },
    { month: 'Mar', revenue: 28000, projects: 7 },
    { month: 'Apr', revenue: 42000, projects: 12 },
    { month: 'May', revenue: 38000, projects: 9 },
    { month: 'Jun', revenue: 45231, projects: 11 }
  ]

  const topClients = [
    { name: 'TechCorp Inc.', revenue: 12500, projects: 3, status: 'active' },
    { name: 'Creative Agency', revenue: 9800, projects: 2, status: 'active' },
    { name: 'Startup Ventures', revenue: 8200, projects: 4, status: 'completed' },
    { name: 'Digital Solutions', revenue: 7500, projects: 2, status: 'active' },
    { name: 'Innovation Labs', revenue: 6900, projects: 1, status: 'active' }
  ]

  const projectCategories = [
    { category: 'Web Development', count: 28, revenue: 18500, color: 'bg-blue-500' },
    { category: 'Mobile Apps', count: 15, revenue: 12800, color: 'bg-green-500' },
    { category: 'Branding', count: 12, revenue: 8200, color: 'bg-purple-500' },
    { category: 'UI/UX Design', count: 8, revenue: 4200, color: 'bg-orange-500' },
    { category: 'Marketing', count: 5, revenue: 1530, color: 'bg-pink-500' }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUp : ArrowDown
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-gray-600 font-light">
                Comprehensive business intelligence and performance metrics 📊
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(analyticsData.revenue.current)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {React.createElement(getChangeIcon(analyticsData.revenue.change), {
                        className: cn("h-3 w-3", getChangeColor(analyticsData.revenue.change))
                      })}
                      <span className={cn("text-sm font-medium", getChangeColor(analyticsData.revenue.change))}>
                        {Math.abs(analyticsData.revenue.change)}%
                      </span>
                      <span className="text-sm text-gray-500">vs last period</span>
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
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.projects.active}</p>
                    <p className="text-sm text-gray-500">{analyticsData.projects.total} total projects</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.clients.total}</p>
                    <p className="text-sm text-blue-600">{analyticsData.clients.new} new this month</p>
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
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.time.efficiency}%</p>
                    <p className="text-sm text-gray-500">{analyticsData.time.billableHours}h billable</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-2xl">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2 rounded-2xl">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 rounded-2xl">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 rounded-2xl">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyRevenue.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium w-8">{month.month}</span>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2 w-32">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(month.revenue / 50000) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(month.revenue)}</p>
                          <p className="text-xs text-gray-500">{month.projects} projects</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Categories */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Project Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectCategories.map(category => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", category.color)} />
                            <span className="text-sm font-medium">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(category.revenue)}</p>
                            <p className="text-xs text-gray-500">{category.count} projects</p>
                          </div>
                        </div>
                        <Progress 
                          value={(category.revenue / 20000) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gross Revenue</span>
                      <span className="font-medium">{formatCurrency(analyticsData.revenue.current)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform Fees</span>
                      <span className="font-medium text-red-600">-${(analyticsData.revenue.current * 0.05).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Processing</span>
                      <span className="font-medium text-red-600">-${(analyticsData.revenue.current * 0.029).toFixed(0)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Net Revenue</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(analyticsData.revenue.current * 0.921)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid Invoices</span>
                      <span className="font-medium text-green-600">{formatCurrency(38200)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-medium text-yellow-600">{formatCurrency(5800)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="font-medium text-red-600">{formatCurrency(1231)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Collection Rate</span>
                        <span className="font-bold">84.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next Month Est.</span>
                      <span className="font-medium">{formatCurrency(48500)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quarter Goal</span>
                      <span className="font-medium">{formatCurrency(150000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="font-medium">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.projects.active}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{analyticsData.projects.completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">8</p>
                    <p className="text-sm text-gray-600">In Review</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{analyticsData.projects.cancelled}</p>
                    <p className="text-sm text-gray-600">Cancelled</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Project Categories Performance</h4>
                  {projectCategories.map(category => (
                    <div key={category.category} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{category.category}</h5>
                        <Badge variant="outline">{category.count} projects</Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Average Revenue</span>
                        <span className="font-medium">{formatCurrency(category.revenue / category.count)}</span>
                      </div>
                      <Progress value={(category.revenue / 20000) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{client.name}</h4>
                          <p className="text-sm text-gray-600">{client.projects} projects</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(client.revenue)}</p>
                        <Badge 
                          variant="outline" 
                          className={client.status === 'active' ? 'text-green-600 border-green-300' : 'text-gray-600'}
                        >
                          {client.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}