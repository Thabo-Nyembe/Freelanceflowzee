'use client'

import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

// Mock data for demonstration
const mockAnalyticsData = {
  overview: {
    totalRevenue: 45750,
    totalProjects: 23,
    activeClients: 8,
    averageProjectValue: 1989,
    completionRate: 94.5,
    responseTime: 2.3
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 3200, projects: 2 },
    { month: 'Feb', revenue: 4100, projects: 3 },
    { month: 'Mar', revenue: 3800, projects: 2 },
    { month: 'Apr', revenue: 5200, projects: 4 },
    { month: 'May', revenue: 4900, projects: 3 },
    { month: 'Jun', revenue: 6100, projects: 4 },
    { month: 'Jul', revenue: 5800, projects: 3 },
    { month: 'Aug', revenue: 7200, projects: 5 },
    { month: 'Sep', revenue: 6800, projects: 4 },
    { month: 'Oct', revenue: 8100, projects: 6 },
    { month: 'Nov', revenue: 7900, projects: 5 },
    { month: 'Dec', revenue: 9200, projects: 7 }
  ],
  topClients: [
    { name: 'TechCorp Inc.', revenue: 12500, projects: 5, status: 'active' },
    { name: 'Design Studio', revenue: 8900, projects: 3, status: 'active' },
    { name: 'StartupXYZ', revenue: 6700, projects: 4, status: 'completed' },
    { name: 'E-commerce Co.', revenue: 5400, projects: 2, status: 'active' },
    { name: 'Marketing Agency', revenue: 4200, projects: 3, status: 'active' }
  ],
  projectTypes: [
    { type: 'Web Development', count: 12, revenue: 28500 },
    { type: 'UI/UX Design', count: 8, revenue: 15200 },
    { type: 'Mobile App', count: 5, revenue: 18900 },
    { type: 'Consulting', count: 6, revenue: 9800 },
    { type: 'Maintenance', count: 4, revenue: 3200 }
  ]
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [data, setData] = useState(mockAnalyticsData)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    // Simulate export functionality
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <h2 className="text-xl font-semibold mb-2">Loading Analytics</h2>
            <p className="text-gray-600">Gathering your performance data...</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-indigo-600" />
                  Analytics Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                  Track your freelance business performance and insights
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${data.overview.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overview.totalProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overview.activeClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Project Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${data.overview.averageProjectValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overview.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overview.responseTime}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Dashboard */}
          <div className="mb-8">
            <AnalyticsDashboard />
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Breakdown</CardTitle>
                  <CardDescription>
                    Revenue and project count by month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{month.month}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="font-semibold">${month.revenue.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Projects</p>
                            <p className="font-semibold">{month.projects}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Clients</CardTitle>
                  <CardDescription>
                    Your highest value clients and their project history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.projects} projects</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status}
                          </Badge>
                          <p className="font-semibold">${client.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Types</CardTitle>
                  <CardDescription>
                    Breakdown of your projects by type and revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.projectTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Target className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Count</p>
                            <p className="font-semibold">{type.count}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="font-semibold">${type.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Key performance indicators for your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Project Completion Rate</span>
                      <span className="text-lg font-bold text-green-600">{data.overview.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="text-lg font-bold text-blue-600">{data.overview.responseTime} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Client Retention Rate</span>
                      <span className="text-lg font-bold text-purple-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">On-Time Delivery</span>
                      <span className="text-lg font-bold text-orange-600">92%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Insights</CardTitle>
                    <CardDescription>
                      AI-powered insights for business growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">💡 Insight</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your web development projects have the highest profit margin. Consider focusing more on this area.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">📈 Opportunity</p>
                      <p className="text-sm text-green-700 mt-1">
                        TechCorp Inc. has been your most valuable client. Consider proposing a retainer agreement.
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">⚠️ Alert</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Your response time has increased by 15% this month. Consider optimizing your workflow.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
} 