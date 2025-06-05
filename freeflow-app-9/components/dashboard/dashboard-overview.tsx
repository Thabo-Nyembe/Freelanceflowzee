"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DollarSign,
  FolderOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

interface DashboardOverviewProps {
  earnings: number
  activeProjects: number
  completedProjects: number
  pendingPayments: number
  recentActivities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

// Mock data for charts
const earningsData = [
  { month: 'Jan', earnings: 4500, projects: 3 },
  { month: 'Feb', earnings: 7200, projects: 5 },
  { month: 'Mar', earnings: 6800, projects: 4 },
  { month: 'Apr', earnings: 9100, projects: 6 },
  { month: 'May', earnings: 12300, projects: 8 },
  { month: 'Jun', earnings: 15750, projects: 7 },
]

const projectStatusData = [
  { name: 'Completed', value: 12, color: '#22c55e' },
  { name: 'In Progress', value: 5, color: '#3b82f6' },
  { name: 'On Hold', value: 2, color: '#f59e0b' },
  { name: 'Planning', value: 3, color: '#8b5cf6' },
]

const weeklyActivity = [
  { day: 'Mon', hours: 8, tasks: 12 },
  { day: 'Tue', hours: 6, tasks: 8 },
  { day: 'Wed', hours: 9, tasks: 15 },
  { day: 'Thu', hours: 7, tasks: 10 },
  { day: 'Fri', hours: 8, tasks: 11 },
  { day: 'Sat', hours: 4, tasks: 5 },
  { day: 'Sun', hours: 2, tasks: 2 },
]

export function DashboardOverview({
  earnings,
  activeProjects,
  completedProjects,
  pendingPayments,
  recentActivities
}: DashboardOverviewProps) {
  const totalProjects = activeProjects + completedProjects
  const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your freelance business.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Update
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              +2 new this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
              -1 from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Earnings Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Your earnings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'earnings' ? `$${value}` : value,
                    name === 'earnings' ? 'Earnings' : 'Projects'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of your current projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {projectStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Hours worked and tasks completed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
                <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'project' && (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FolderOpen className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'feedback' && (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'payment' && (
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentActivities.length === 0 && (
                <div className="text-center py-6">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No recent activity
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start working on projects to see activity here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="text-sm font-medium">$12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Projects</span>
                <span className="text-sm font-medium">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hours</span>
                <span className="text-sm font-medium">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/avatars/client-1.jpg" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">TechCorp Inc.</p>
                <p className="text-xs text-muted-foreground">$8,500 total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">E-commerce Website</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Due in 3 days</Badge>
                <Badge variant="secondary">High Priority</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 