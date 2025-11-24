'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  ADMIN_MODULES,
  SYSTEM_ALERTS,
  DASHBOARD_STATS,
  PERFORMANCE_INDICATORS,
  RECENT_METRICS,
  TOP_PERFORMERS,
  getModuleStatusColor,
  getAlertLevelColor,
  getPerformanceStatusColor,
  getTrendIcon,
  formatMetricValue,
  getUnreadAlerts,
  getRecentActivity
} from '@/lib/admin-dashboard-utils'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function AdminOverviewPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const unreadAlerts = getUnreadAlerts(SYSTEM_ALERTS)
  const recentActivity = getRecentActivity(ADMIN_MODULES, 8)

  // A+++ LOAD ADMIN OVERVIEW DATA
  useEffect(() => {
    const loadAdminOverviewData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load admin overview'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Admin overview loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin overview')
        setIsLoading(false)
        announce('Error loading admin overview', 'assertive')
      }
    }

    loadAdminOverviewData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto space-y-8">
          <div className="space-y-8">
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <ListSkeleton items={3} />
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Admin Overview
              </TextShimmer>
              <p className="text-muted-foreground">
                Unified dashboard for all business operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
                Refresh Data
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* System Alerts */}
        {unreadAlerts.length > 0 && (
          <ScrollReveal delay={0.1}>
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    🔔 System Alerts
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">
                      {unreadAlerts.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    {showAllAlerts ? 'Show Less' : 'View All'}
                  </button>
                </div>
                <div className="space-y-3">
                  {(showAllAlerts ? SYSTEM_ALERTS : unreadAlerts.slice(0, 3)).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getAlertLevelColor(alert.level)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{alert.title}</div>
                          <p className="text-sm opacity-90">{alert.message}</p>
                          <div className="text-xs opacity-75 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {alert.actionPath && (
                          <Link
                            href={alert.actionPath}
                            className="px-3 py-1 bg-white/50 dark:bg-black/50 rounded text-sm font-medium hover:bg-white/80 dark:hover:bg-black/80 transition-colors"
                          >
                            {alert.actionLabel || 'View'}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Key Metrics */}
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-green-500">
                      ${(DASHBOARD_STATS.totalRevenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
                <div className="text-xs text-green-500">
                  ↗ +{DASHBOARD_STATS.revenueGrowth.toFixed(1)}% this month
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Active Clients</div>
                    <div className="text-3xl font-bold text-blue-500">
                      {DASHBOARD_STATS.activeClients}
                    </div>
                  </div>
                  <div className="text-2xl">👥</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  of {DASHBOARD_STATS.totalClients} total
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Hot Leads</div>
                    <div className="text-3xl font-bold text-red-500">
                      {DASHBOARD_STATS.hotLeads}
                    </div>
                  </div>
                  <div className="text-2xl">🔥</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  of {DASHBOARD_STATS.totalLeads} total leads
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Email Open Rate</div>
                    <div className="text-3xl font-bold text-purple-500">
                      {DASHBOARD_STATS.emailOpenRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-2xl">📧</div>
                </div>
                <div className="text-xs text-green-500">
                  Above industry average
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </ScrollReveal>

        {/* Admin Modules Grid */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ADMIN_MODULES.map((module, index) => (
              <LiquidGlassCard key={module.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{module.icon}</div>
                      <div>
                        <h3 className="font-semibold">{module.name}</h3>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getModuleStatusColor(module.status)}`}>
                      {module.status}
                    </span>
                  </div>

                  {/* Module Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {module.metrics.slice(0, 2).map((metric) => (
                      <div key={metric.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                        <div className="text-lg font-bold" style={{ color: metric.color }}>
                          {formatMetricValue(metric.value, metric.format)}
                        </div>
                        {metric.trend && (
                          <div className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                            {getTrendIcon(metric.trend)} {metric.changePercent ? `${metric.changePercent.toFixed(1)}%` : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  {module.recentActivity.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <div className="text-xs text-muted-foreground mb-2">Recent Activity</div>
                      {module.recentActivity.slice(0, 1).map((activity) => (
                        <div key={activity.id} className="text-sm">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-xs text-muted-foreground">{activity.description}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={module.path}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Open {module.name}
                    </Link>
                    {module.quickActions.length > 0 && (
                      <button className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                        {module.quickActions[0].icon}
                      </button>
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Performance Indicators & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Indicators */}
          <ScrollReveal delay={0.4}>
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Performance Indicators</h3>
                <div className="space-y-4">
                  {PERFORMANCE_INDICATORS.map((indicator) => (
                    <div key={indicator.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{indicator.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${getPerformanceStatusColor(indicator.status)}`}>
                            {indicator.value.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {indicator.target}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((indicator.value / indicator.target) * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${
                            indicator.status === 'excellent' ? 'bg-green-500' :
                            indicator.status === 'good' ? 'bg-blue-500' :
                            indicator.status === 'fair' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          {/* Recent Activity */}
          <ScrollReveal delay={0.5}>
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const module = ADMIN_MODULES.find(m => m.id === activity.moduleId)
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="text-xl">{module?.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-xs text-muted-foreground">{activity.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>

        {/* Metrics Chart & Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Metrics */}
          <ScrollReveal delay={0.6}>
            <LiquidGlassCard className="lg:col-span-2">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Weekly Overview</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {RECENT_METRICS.map((data, index) => {
                    const maxRevenue = Math.max(...RECENT_METRICS.map(d => d.revenue))
                    const height = (data.revenue / maxRevenue) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.1 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-emerald-400 relative group cursor-pointer"
                        >
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                            <div className="font-bold">${(data.revenue / 1000).toFixed(1)}K</div>
                            <div className="text-gray-300">{data.leads} leads</div>
                            <div className="text-gray-300">{data.clients} clients</div>
                          </div>
                        </motion.div>
                        <div className="text-xs text-muted-foreground font-medium">{data.date}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          {/* Top Performers */}
          <ScrollReveal delay={0.7}>
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Top Performers</h3>
                <div className="space-y-4">
                  {TOP_PERFORMERS.map((performer, index) => (
                    <div key={performer.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{performer.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {performer.category} • {performer.metric}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-500">
                        {performer.category === 'campaign' || performer.category === 'project'
                          ? `${performer.value}%`
                          : performer.metric === 'Revenue'
                          ? `$${(performer.value / 1000).toFixed(0)}K`
                          : performer.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
