'use client'

import { useBusinessMetrics, usePlatformStats, useMarketingContent } from '@/hooks/use-dynamic-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Megaphone,
  Sparkles,
  Quote
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CommunityAnnouncements() {
  const { content, loading } = useMarketingContent()

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-200 dark:bg-orange-800 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-3/4" />
              <div className="h-3 bg-orange-200 dark:bg-orange-800 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter for announcements or featured content
  if (!content || content.length === 0) return null

  const announcements = content.filter(c => c.is_featured || c.category === 'hero')
  if (announcements.length === 0) return null

  const featured = announcements[0]

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Megaphone className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                Featured
              </Badge>
              <span className="text-xs text-muted-foreground">Announcement</span>
            </div>
            <h3 className="font-semibold text-lg">{featured.title}</h3>
            {featured.subtitle && (
              <p className="text-sm text-muted-foreground">{featured.subtitle}</p>
            )}
            {featured.content && (
              <p className="text-sm mt-2">{featured.content}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CommunityMetricsBar() {
  const { stats, loading } = usePlatformStats()

  if (loading) {
    return (
      <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-1">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users,
    Folder: FolderOpen,
    DollarSign,
    Globe,
    Shield,
    Star
  }

  const formatValue = (value: number, label: string) => {
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
    return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)
  }

  if (!stats || stats.length === 0) return null

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg overflow-x-auto">
      {stats.slice(0, 6).map((stat) => {
        const Icon = iconMap[stat.icon || 'Activity'] || Activity
        return (
          <div key={stat.id} className="flex items-center gap-2 min-w-fit">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-bold text-lg">{formatValue(stat.stat_value, stat.stat_label)}</p>
              <p className="text-xs text-muted-foreground">{stat.stat_label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CommunityTestimonials() {
  const { content, loading } = useMarketingContent('testimonials')

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!content || content.length === 0) return null

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {content.slice(0, 2).map((testimonial) => {
        const metadata = testimonial.metadata as { rating?: number; avatar?: string; company?: string }
        return (
          <Card key={testimonial.id} className="relative overflow-hidden">
            <div className="absolute top-2 right-2 text-6xl text-muted-foreground/10">
              <Quote />
            </div>
            <CardContent className="p-4 relative">
              <p className="text-sm italic mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                {metadata?.avatar && (
                  <img src={metadata.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  loading="lazy" />
                )}
                <div>
                  <p className="font-medium text-sm">{testimonial.subtitle}</p>
                  {metadata?.company && (
                    <p className="text-xs text-muted-foreground">{metadata.company}</p>
                  )}
                </div>
                {metadata?.rating && (
                  <div className="ml-auto flex items-center gap-1">
                    {[...Array(metadata.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function CommunityGrowthMetrics() {
  const { metrics, loading } = useBusinessMetrics()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || metrics.length === 0) return null

  const publicMetrics = metrics.filter(m => (m as { is_public?: boolean }).is_public)

  if (publicMetrics.length === 0) return null

  const formatValue = (value: number, unit: string) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      }).format(value)
    }
    if (unit === 'percentage') return `${value}%`
    if (unit === 'rating') return `${value}/5`
    return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Platform Growth
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {publicMetrics.slice(0, 5).map((metric) => (
          <div key={metric.id} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{metric.metric_name}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatValue(metric.current_value, metric.unit)}</span>
              {metric.change_percentage && (
                <span className={cn(
                  "flex items-center text-xs",
                  metric.trend === 'up' && "text-green-500",
                  metric.trend === 'down' && "text-red-500"
                )}>
                  {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-0.5" />}
                  {metric.trend === 'down' && <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {metric.trend === 'stable' && <Minus className="h-3 w-3 mr-0.5" />}
                  {Math.abs(metric.change_percentage)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function CommunityDynamicSection() {
  return (
    <div className="space-y-6">
      <CommunityAnnouncements />
      <CommunityMetricsBar />
      <div className="grid lg:grid-cols-2 gap-6">
        <CommunityGrowthMetrics />
        <div className="space-y-6">
          <CommunityTestimonials />
        </div>
      </div>
    </div>
  )
}
