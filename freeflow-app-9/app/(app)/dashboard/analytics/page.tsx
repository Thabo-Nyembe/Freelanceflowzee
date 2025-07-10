'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  DollarSign,
  Users,
  Clock,
  Download,
  Target,
  Award,
  FileText,
  Star,
  Activity,
  PieChart,
  LineChart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface _ChartData {
  name: string
  value: number
  color: string
}

interface Project {
  id: string
  name: string
  status: string
  completion: number
  revenue: number
  client: string
  timeline: string
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$45,240',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Projects',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Client Satisfaction',
      value: '96%',
      change: '+2.1%',
      trend: 'up',
      icon: Star,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Response Time',
      value: '2.4h',
      change: '-15min',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Total Clients',
      value: '48',
      change: '+6',
      trend: 'up',
      icon: Users,
      color: 'text-cyan-600'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+1.8%',
      trend: 'up',
      icon: Target,
      color: 'text-emerald-600'
    }
  ]

  const revenueData = [
    { name: 'Jan', value: 3200, color: '#8B5CF6' },
    { name: 'Feb', value: 4100, color: '#8B5CF6' },
    { name: 'Mar', value: 3800, color: '#8B5CF6' },
    { name: 'Apr', value: 4500, color: '#8B5CF6' },
    { name: 'May', value: 5200, color: '#8B5CF6' },
    { name: 'Jun', value: 4800, color: '#8B5CF6' }
  ]

  const projectTypes = [
    { name: 'Web Development', value: 35, color: '#8B5CF6' },
    { name: 'Design', value: 25, color: '#06B6D4' },
    { name: 'Video Editing', value: 20, color: '#10B981' },
    { name: 'Content Creation', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#EF4444' }
  ]

  const topProjects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Redesign',
      status: 'In Progress',
      completion: 75,
      revenue: 8500,
      client: 'TechCorp Inc.',
      timeline: '3 weeks'
    },
    {
      id: '2',
      name: 'Brand Identity Package',
      status: 'Review',
      completion: 90,
      revenue: 6200,
      client: 'StartupXYZ',
      timeline: '1 week'
    },
    {
      id: '3',
      name: 'Video Campaign',
      status: 'Completed',
      completion: 100,
      revenue: 4800,
      client: 'Marketing Pro',
      timeline: 'Delivered'
    },
    {
      id: '4',
      name: 'Mobile App UI',
      status: 'Planning',
      completion: 25,
      revenue: 12000,
      client: 'InnovateLabs',
      timeline: '6 weeks'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Review': return 'bg-yellow-100 text-yellow-800'
      case 'Planning': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Real-time insights</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => alert('Exporting analytics data...')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {metric.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.change}
                          </span>
                          <span className="text-sm text-gray-500">vs last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg bg-gray-50`}>
                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {revenueData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 bg-purple-500 rounded-t"
                          style={{ height: `${(item.value / 5200) * 200}px` }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Monthly Revenue Growth</p>
                    <p className="text-lg font-semibold text-green-600">+18.2% this quarter</p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Project Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projectTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm text-gray-600">{type.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${type.value}%`,
                                backgroundColor: type.color
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{type.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Performing Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProjects.map((project) => (
                        <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">{project.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">{project.client}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-purple-500 rounded-full"
                                  style={{ width: `${project.completion}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{project.completion}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-green-600">
                              ${project.revenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">{project.timeline}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <div className="h-full flex flex-col">
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Monthly Revenue Trend</h3>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                          {[
                            { month: 'Jul', amount: 3200, height: 45 },
                            { month: 'Aug', amount: 4100, height: 58 },
                            { month: 'Sep', amount: 3800, height: 53 },
                            { month: 'Oct', amount: 4500, height: 64 },
                            { month: 'Nov', amount: 5200, height: 74 },
                            { month: 'Dec', amount: 4800, height: 68 }
                          ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 flex-1">
                              <div className="text-xs font-medium text-gray-700">
                                ${(item.amount / 1000).toFixed(1)}k
                              </div>
                              <div
                                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300 hover:from-purple-700 hover:to-purple-500 cursor-pointer"
                                style={{ height: `${item.height}%` }}
                                title={`${item.month}: $${item.amount.toLocaleString()}`}
                              />
                              <span className="text-xs text-gray-600 font-medium">{item.month}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-auto text-center p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Total Revenue Growth</p>
                        <p className="text-lg font-semibold text-green-600">+25.4% vs last quarter</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">$12,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Month</span>
                      <span className="font-semibold">$10,230</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Growth</span>
                      <span className="font-semibold text-green-600">+21.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">24</h3>
                      <p className="text-sm text-blue-700">Active Projects</p>
                      <div className="mt-2 text-xs text-blue-600">+3 this month</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-600">94%</h3>
                      <p className="text-sm text-green-700">On-Time Delivery</p>
                      <div className="mt-2 text-xs text-green-600">+2% improvement</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-purple-600">$185K</h3>
                      <p className="text-sm text-purple-700">Total Project Value</p>
                      <div className="mt-2 text-xs text-purple-600">+18% growth</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Project Status Distribution</h3>
                    {[
                      { status: 'Completed', count: 12, color: 'bg-green-500', percentage: 50 },
                      { status: 'In Progress', count: 8, color: 'bg-blue-500', percentage: 33 },
                      { status: 'Planning', count: 3, color: 'bg-yellow-500', percentage: 12 },
                      { status: 'On Hold', count: 1, color: 'bg-gray-500', percentage: 5 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium min-w-[80px]">{item.status}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[60px] text-right">
                          {item.count} projects
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Client Distribution</h3>
                      <div className="space-y-3">
                        {[
                          { type: 'Enterprise', count: 8, color: 'bg-purple-500', revenue: '$124K' },
                          { type: 'SMB', count: 15, color: 'bg-blue-500', revenue: '$68K' },
                          { type: 'Startups', count: 12, color: 'bg-green-500', revenue: '$42K' },
                          { type: 'Individual', count: 13, color: 'bg-orange-500', revenue: '$18K' }
                        ].map((client, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${client.color}`} />
                              <div>
                                <p className="font-medium">{client.type}</p>
                                <p className="text-sm text-gray-600">{client.count} clients</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{client.revenue}</p>
                              <p className="text-xs text-gray-500">avg revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Client Satisfaction</h3>
                      <div className="space-y-4">
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                          <div className="text-sm text-green-700">Overall Satisfaction</div>
                          <div className="mt-2 text-xs text-green-600">+2.1% this month</div>
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            { metric: 'Communication', score: 98 },
                            { metric: 'Quality', score: 96 },
                            { metric: 'Timeliness', score: 94 },
                            { metric: 'Value', score: 92 }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{item.metric}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-green-500 rounded-full"
                                    style={{ width: `${item.score}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{item.score}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Productivity Score', value: '92%', trend: '+5%', color: 'text-green-600' },
                      { label: 'Efficiency Rating', value: '8.7/10', trend: '+0.3', color: 'text-blue-600' },
                      { label: 'Task Completion', value: '94%', trend: '+2%', color: 'text-purple-600' },
                      { label: 'Client Response', value: '2.4h', trend: '-15min', color: 'text-orange-600' }
                    ].map((metric, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                        <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                        <div className={`text-xs ${metric.color}`}>{metric.trend} vs last month</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Weekly Performance</h3>
                      <div className="space-y-3">
                        {[
                          { day: 'Monday', hours: 8.5, efficiency: 89 },
                          { day: 'Tuesday', hours: 7.8, efficiency: 92 },
                          { day: 'Wednesday', hours: 8.2, efficiency: 95 },
                          { day: 'Thursday', hours: 8.0, efficiency: 88 },
                          { day: 'Friday', hours: 7.5, efficiency: 91 }
                        ].map((day, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{day.day}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">{day.hours}h</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-purple-500 rounded-full"
                                  style={{ width: `${day.efficiency}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{day.efficiency}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Performance Insights</h3>
                      <div className="space-y-2">
                        {[
                          { insight: 'Peak productivity: 9-11 AM', type: 'success' },
                          { insight: 'Avg break time: 15 min optimal', type: 'info' },
                          { insight: 'Focus sessions: 85% completion', type: 'success' },
                          { insight: 'Distraction rate: 12% (improving)', type: 'warning' }
                        ].map((item, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            item.type === 'success' ? 'bg-green-50 border-green-200' :
                            item.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          } border`}>
                            <p className={`text-sm ${
                              item.type === 'success' ? 'text-green-700' :
                              item.type === 'warning' ? 'text-yellow-700' :
                              'text-blue-700'
                            }`}>{item.insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
