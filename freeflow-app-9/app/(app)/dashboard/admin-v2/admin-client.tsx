'use client'

import { useState } from 'react'
import {
  Users, Database, Shield, Activity, Server, Settings,
  BarChart3, Clock, CheckCircle, XCircle, AlertTriangle,
  TrendingUp, TrendingDown, Eye, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Demo data for admin dashboard
const demoStats = {
  totalUsers: 2847,
  activeProjects: 156,
  systemHealth: 98.5,
  apiCalls: 45230,
  dataStorage: '2.3 TB',
  uptime: '99.9%',
  activeServers: 12,
  pendingTasks: 23
}

const demoUsers = [
  { id: '1', name: 'Alex Johnson', email: 'alex@freeflow.io', role: 'admin', status: 'active', lastLogin: '2 hours ago' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@company.com', role: 'user', status: 'active', lastLogin: '1 day ago' },
  { id: '3', name: 'Mike Chen', email: 'mike@startup.io', role: 'user', status: 'active', lastLogin: '3 hours ago' },
  { id: '4', name: 'Emma Davis', email: 'emma@agency.com', role: 'moderator', status: 'active', lastLogin: '30 min ago' },
]

const demoActivities = [
  { id: '1', user: 'Alex Johnson', action: 'Updated project settings', timestamp: '5 min ago', type: 'update' },
  { id: '2', user: 'Sarah Wilson', action: 'Created new invoice', timestamp: '15 min ago', type: 'create' },
  { id: '3', user: 'System', action: 'Automated backup completed', timestamp: '1 hour ago', type: 'system' },
  { id: '4', user: 'Mike Chen', action: 'Uploaded design files', timestamp: '2 hours ago', type: 'upload' },
]

const demoSystemMetrics = [
  { name: 'CPU Usage', value: 45, unit: '%', status: 'good' as const, trend: 'stable' },
  { name: 'Memory', value: 62, unit: '%', status: 'good' as const, trend: 'up' },
  { name: 'Disk Space', value: 78, unit: '%', status: 'warning' as const, trend: 'up' },
  { name: 'Network', value: 32, unit: 'Mbps', status: 'good' as const, trend: 'stable' },
]

export default function AdminClient({ initialSettings }: { initialSettings: any[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              Business Admin Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete system administration and analytics dashboard
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            label="Total Users"
            value={demoStats.totalUsers.toLocaleString()}
            trend="+12%"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-green-600" />}
            label="Active Projects"
            value={demoStats.activeProjects.toString()}
            trend="+8%"
          />
          <StatCard
            icon={<Database className="w-6 h-6 text-purple-600" />}
            label="Data Storage"
            value={demoStats.dataStorage}
            trend="+5%"
          />
          <StatCard
            icon={<Server className="w-6 h-6 text-orange-600" />}
            label="System Health"
            value={`${demoStats.systemHealth}%`}
            trend="stable"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* System Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {demoSystemMetrics.map((metric) => (
                  <MetricCard key={metric.name} metric={metric} />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {demoActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Last Login</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.lastLogin}</td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Log
              </h3>
              <div className="space-y-3">
                {demoActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.user}</p>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{activity.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <div className="grid gap-6">
              {/* System Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Status
                </h3>
                <div className="space-y-4">
                  <StatusItem label="API Servers" value={`${demoStats.activeServers} active`} status="good" />
                  <StatusItem label="Database" value="Healthy" status="good" />
                  <StatusItem label="Cache Layer" value="Operational" status="good" />
                  <StatusItem label="Uptime" value={demoStats.uptime} status="good" />
                  <StatusItem label="API Calls (24h)" value={demoStats.apiCalls.toLocaleString()} status="good" />
                </div>
              </div>

              {/* Server Resources */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Server Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoSystemMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm text-gray-600">{metric.value}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  const isPositive = trend.startsWith('+')
  const isNeutral = trend === 'stable'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        {icon}
        <span className={`text-sm font-medium flex items-center gap-1 ${
          isNeutral ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {!isNeutral && (isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
    </div>
  )
}

function MetricCard({ metric }: { metric: typeof demoSystemMetrics[0] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{metric.name}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          metric.status === 'good' ? 'bg-green-100 text-green-700' :
          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {metric.value}{metric.unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              metric.status === 'good' ? 'bg-green-500' :
              metric.status === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${metric.value}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: typeof demoActivities[0] }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="w-2 h-2 rounded-full bg-blue-500" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{activity.user}</span>
          <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
        </div>
      </div>
      <span className="text-sm text-gray-500">{activity.timestamp}</span>
    </div>
  )
}

function StatusItem({ label, value, status }: { label: string; value: string; status: 'good' | 'warning' | 'critical' }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {status === 'good' && <CheckCircle className="w-4 h-4 text-green-600" />}
        {status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
        {status === 'critical' && <XCircle className="w-4 h-4 text-red-600" />}
      </div>
    </div>
  )
}
