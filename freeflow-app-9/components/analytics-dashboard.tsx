'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Users, 
  Target, 
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react'

export default function AnalyticsDashboard() {
  const metrics = useMemo(() => [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Total Clients',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600'
    }
  ], [])

  const projectProgress = useMemo(() => [
    { name: 'E-commerce Redesign', progress: 85, status: 'On Track' },
    { name: 'Mobile App UI', progress: 60, status: 'In Progress' },
    { name: 'Brand Identity', progress: 100, status: 'Completed' },
    { name: 'Website Optimization', progress: 45, status: 'Behind Schedule' }
  ], [])

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.color}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectProgress.map((project, index) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Completed': return 'bg-green-100 text-green-800'
                    case 'On Track': return 'bg-blue-100 text-blue-800'
                    case 'In Progress': return 'bg-yellow-100 text-yellow-800'
                    case 'Behind Schedule': return 'bg-red-100 text-red-800'
                    default: return 'bg-gray-100 text-gray-800'
                  }
                }
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{project.name}</span>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="text-sm text-gray-600">
                      {project.progress}% Complete
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Project milestone completed</p>
                <p className="text-sm text-gray-600">E-commerce Redesign - Phase 2</p>
              </div>
              <span className="text-sm text-gray-500 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium">New client review</p>
                <p className="text-sm text-gray-600">5-star rating from TechCorp</p>
              </div>
              <span className="text-sm text-gray-500 ml-auto">4 hours ago</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Payment pending</p>
                <p className="text-sm text-gray-600">Invoice #1234 awaiting approval</p>
              </div>
              <span className="text-sm text-gray-500 ml-auto">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
