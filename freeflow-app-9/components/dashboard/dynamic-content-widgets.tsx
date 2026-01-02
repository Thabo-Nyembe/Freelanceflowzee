'use client'

import { useBusinessMetrics, usePlatformStats, useActivityFeed } from '@/hooks/use-dynamic-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  FolderOpen,
  DollarSign,
  Globe,
  Shield,
  Star,
  Activity,
  Sparkles,
  FileText,
  UserPlus,
  LogIn,
  Trophy,
  Layout
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Folder: FolderOpen,
  DollarSign,
  Globe,
  Shield,
  Star,
  Sparkles,
  FileText,
  UserPlus,
  LogIn,
  Trophy,
  Layout,
  Activity
}

export function BusinessMetricsWidget() {
  const { metrics, loading } = useBusinessMetrics()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: value >= 1000000 ? 'compact' : 'standard'
      }).format(value)
    }
    if (unit === 'percentage') {
      return `${value}%`
    }
    if (unit === 'rating') {
      return `${value}/5`
    }
    return new Intl.NumberFormat('en-US', {
      notation: value >= 10000 ? 'compact' : 'standard'
    }).format(value)
  }

  if (!metrics || metrics.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Business Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.slice(0, 5).map((metric) => (
          <div key={metric.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.metric_name}</p>
              <p className="text-xl font-semibold">
                {formatValue(metric.current_value, metric.unit)}
              </p>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm",
              metric.trend === 'up' && "text-green-500",
              metric.trend === 'down' && "text-red-500",
              metric.trend === 'stable' && "text-gray-500"
            )}>
              {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {metric.trend === 'down' && <TrendingDown className="h-4 w-4" />}
              {metric.trend === 'stable' && <Minus className="h-4 w-4" />}
              {metric.change_percentage && (
                <span>{Math.abs(metric.change_percentage)}%</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function PlatformStatsWidget() {
  const { stats, loading } = usePlatformStats()

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const colorMap: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10'
  }

  const formatStatValue = (value: number, label: string) => {
    if (label.toLowerCase().includes('revenue')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      }).format(value)
    }
    if (label.toLowerCase().includes('%')) {
      return `${value}%`
    }
    if (label.toLowerCase().includes('rating')) {
      return `${value}/5`
    }
    return new Intl.NumberFormat('en-US', {
      notation: value >= 10000 ? 'compact' : 'standard'
    }).format(value)
  }

  if (!stats || stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const IconComponent = iconMap[stat.icon || 'Activity'] || Activity
        const colorClass = colorMap[stat.color] || colorMap.blue

        return (
          <Card key={stat.id}>
            <CardContent className="p-4">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", colorClass)}>
                <IconComponent className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">
                {formatStatValue(stat.stat_value, stat.stat_label)}
              </p>
              <p className="text-sm text-muted-foreground">{stat.stat_label}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function ActivityFeedWidget() {
  const { activities, loading } = useActivityFeed(10)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!activities) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = iconMap[activity.icon || 'Activity'] || Activity

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DynamicContentSection() {
  return (
    <div className="space-y-6">
      <PlatformStatsWidget />
      <div className="grid md:grid-cols-2 gap-6">
        <BusinessMetricsWidget />
        <ActivityFeedWidget />
      </div>
    </div>
  )
}
