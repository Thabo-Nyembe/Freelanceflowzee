'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  AVAILABLE_INTEGRATIONS,
  CONNECTED_INTEGRATIONS,
  INTEGRATION_TEMPLATES,
  INTEGRATION_METRICS,
  getStatusColor,
  getCategoryIcon,
  getIntegrationsByCategory,
  formatDataSize
} from '@/lib/integrations-utils'
import type { IntegrationCategory } from '@/lib/integrations-types'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

type ViewMode = 'overview' | 'browse' | 'connected' | 'templates'

export default function IntegrationsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all')

  // A+++ LOAD INTEGRATIONS DATA
  useEffect(() => {
    const loadIntegrationsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load integrations'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Integrations loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load integrations')
        setIsLoading(false)
        announce('Error loading integrations', 'assertive')
      }
    }

    loadIntegrationsData()
  }, [announce])

  const viewTabs = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: '📊' },
    { id: 'browse' as ViewMode, label: 'Browse All', icon: '🔍' },
    { id: 'connected' as ViewMode, label: 'Connected', icon: '🔗' },
    { id: 'templates' as ViewMode, label: 'Templates', icon: '📋' }
  ]

  const categories: Array<IntegrationCategory | 'all'> = [
    'all',
    'payment',
    'communication',
    'productivity',
    'analytics',
    'storage',
    'marketing',
    'crm',
    'development'
  ]

  const filteredIntegrations = selectedCategory === 'all'
    ? AVAILABLE_INTEGRATIONS
    : getIntegrationsByCategory(selectedCategory)

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Integrations
              </TextShimmer>
              <p className="text-muted-foreground">
                Connect KAZI with your favorite tools and services
              </p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-colors">
              Request Integration
            </button>
          </div>
        </ScrollReveal>

        {/* View Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Overview */}
        {viewMode === 'overview' && (
          <>
            {/* Metrics */}
            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Available</div>
                        <div className="text-3xl font-bold text-blue-500">
                          {INTEGRATION_METRICS.totalIntegrations}
                        </div>
                      </div>
                      <div className="text-2xl">🔌</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      integrations available
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Connected</div>
                        <div className="text-3xl font-bold text-green-500">
                          {INTEGRATION_METRICS.connectedIntegrations}
                        </div>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                    <div className="text-xs text-green-500">
                      Active connections
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Syncs</div>
                        <div className="text-3xl font-bold text-purple-500">
                          {INTEGRATION_METRICS.totalSyncs}
                        </div>
                      </div>
                      <div className="text-2xl">🔄</div>
                    </div>
                    <div className="text-xs text-purple-500">
                      {INTEGRATION_METRICS.successRate.toFixed(1)}% success rate
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Data Transferred</div>
                        <div className="text-3xl font-bold text-orange-500">
                          {formatDataSize(INTEGRATION_METRICS.dataTransferred)}
                        </div>
                      </div>
                      <div className="text-2xl">📊</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      This month
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </ScrollReveal>

            {/* Connected Integrations */}
            <ScrollReveal delay={0.3}>
              <LiquidGlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Connected Integrations</h3>
                    <button
                      onClick={() => setViewMode('connected')}
                      className="text-sm text-green-500 hover:text-green-600 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CONNECTED_INTEGRATIONS.slice(0, 6).map((conn) => {
                      const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === conn.integrationId)
                      if (!integration) return null
                      return (
                        <div
                          key={conn.integrationId}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{integration.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold">{integration.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {integration.category}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>🔄 {conn.syncStats.totalSyncs} syncs</div>
                            <div>✅ {conn.syncStats.successRate}% success</div>
                            <div>📊 {formatDataSize(conn.syncStats.dataTransferred)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Popular Templates */}
            <ScrollReveal delay={0.4}>
              <LiquidGlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Integration Templates</h3>
                    <button
                      onClick={() => setViewMode('templates')}
                      className="text-sm text-green-500 hover:text-green-600 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INTEGRATION_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-semibold mb-1">{template.name}</div>
                        <div className="text-xs text-muted-foreground mb-3">{template.description}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">{template.workflow}</div>
                          <div className="text-xs text-green-500 font-medium">{template.usageCount} uses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* Browse All */}
        {viewMode === 'browse' && (
          <>
            {/* Category Filter */}
            <ScrollReveal delay={0.2}>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    {category !== 'all' && <span className="mr-2">{getCategoryIcon(category as IntegrationCategory)}</span>}
                    <span className="capitalize">{category}</span>
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Integrations Grid */}
            <ScrollReveal delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredIntegrations.map((integration) => (
                  <LiquidGlassCard key={integration.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{integration.icon}</div>
                        {integration.isPremium && (
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                            Pro
                          </span>
                        )}
                        {integration.isPopular && (
                          <span className="text-xs px-2 py-1 bg-green-500 text-white rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{integration.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">Category:</span>
                          <span className="font-medium">{integration.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Auth:</span>
                          <span className="font-medium capitalize">{integration.authType}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(integration.status)}`}>
                            {integration.status}
                          </span>
                        </div>
                      </div>

                      <button
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          integration.status === 'connected'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>
            </ScrollReveal>
          </>
        )}

        {/* Connected */}
        {viewMode === 'connected' && (
          <ScrollReveal delay={0.2}>
            <div className="space-y-6">
              {CONNECTED_INTEGRATIONS.map((conn) => {
                const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === conn.integrationId)
                if (!integration) return null
                return (
                  <LiquidGlassCard key={conn.integrationId}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">{integration.icon}</div>
                          <div>
                            <h3 className="text-2xl font-bold">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Connected: {conn.connectedAt.toLocaleDateString()}</span>
                              <span>Last Sync: {conn.lastSync?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                            Settings
                          </button>
                          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                            Disconnect
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">Total Syncs</div>
                          <div className="text-2xl font-bold text-blue-500">{conn.syncStats.totalSyncs}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
                          <div className="text-2xl font-bold text-green-500">
                            {((conn.syncStats.successfulSyncs / conn.syncStats.totalSyncs) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">Failed Syncs</div>
                          <div className="text-2xl font-bold text-red-500">{conn.syncStats.failedSyncs}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">Data Transferred</div>
                          <div className="text-2xl font-bold text-purple-500">
                            {formatDataSize(conn.syncStats.dataTransferred)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                )
              })}
            </div>
          </ScrollReveal>
        )}

        {/* Templates */}
        {viewMode === 'templates' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INTEGRATION_TEMPLATES.map((template) => (
                <LiquidGlassCard key={template.id}>
                  <div className="p-6">
                    <div className="text-5xl mb-4">{template.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Required Integrations:</div>
                      <div className="flex flex-wrap gap-2">
                        {template.integrations.map((intId) => {
                          const int = AVAILABLE_INTEGRATIONS.find(i => i.id === intId)
                          return int ? (
                            <span key={intId} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
                              <span>{int.icon}</span>
                              <span>{int.name}</span>
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground">Workflow:</div>
                      <div className="text-sm font-mono bg-muted/30 p-2 rounded mt-1">{template.workflow}</div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">Used {template.usageCount} times</span>
                    </div>

                    <button className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Use Template
                    </button>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
