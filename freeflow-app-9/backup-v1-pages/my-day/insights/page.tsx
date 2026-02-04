'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, TrendingUp, Calendar, Activity, Zap, RefreshCw, Download, X, Filter, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'

// MY DAY UTILITIES
import { mockAIInsights, type AIInsight } from '@/lib/my-day-utils'

const logger = createSimpleLogger('MyDay-Insights')

const ADDITIONAL_INSIGHTS: AIInsight[] = [
  {
    id: 'insight_4',
    type: 'optimization',
    title: 'Task Batching Opportunity',
    description: 'You have 3 similar design tasks scheduled separately. Batch them together for 25% efficiency gain.',
    actionable: true,
    priority: 'medium'
  },
  {
    id: 'insight_5',
    type: 'productivity',
    title: 'Focus Block Extension',
    description: 'Your morning focus sessions average 45 minutes. Try extending to 90 minutes for deep work.',
    actionable: true,
    priority: 'low'
  }
]

const TYPE_STYLES: Record<string, { bg: string; darkBg: string; iconColor: string }> = {
  productivity: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  schedule: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
  health: { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
  optimization: { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' }
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400',
  medium: 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400',
  low: 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
}

export default function InsightsPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights)
  const [appliedInsights, setAppliedInsights] = useState<Set<string>>(new Set())
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Apply AI suggestion
  const handleApplyAISuggestion = useCallback((insightId: string) => {
    const insight = insights.find(i => i.id === insightId)
    if (!insight) return

    setAppliedInsights(prev => new Set(prev).add(insightId))
    toast.success('AI Suggestion Applied', {
      description: `${insight.title} - ${insight.type} optimization applied`
    })
    logger.info('Insight applied', { insightId, type: insight.type })
    announce('AI suggestion applied', 'polite')
  }, [insights, announce])

  // Dismiss insight
  const handleDismissInsight = useCallback((insightId: string) => {
    setDismissedInsights(prev => new Set(prev).add(insightId))
    toast.info('Insight Dismissed')
    logger.info('Insight dismissed', { insightId })
    announce('Insight dismissed', 'polite')
  }, [announce])

  // Refresh insights
  const handleRefreshInsights = useCallback(async () => {
    setIsRefreshing(true)

    // Generate fresh insights from current data
    // Add new insights and reset
    const newInsights = [...mockAIInsights, ...ADDITIONAL_INSIGHTS].sort(() => Math.random() - 0.5)
    setInsights(newInsights)
    setAppliedInsights(new Set())
    setDismissedInsights(new Set())

    toast.success('Insights Refreshed', { description: `${newInsights.length} new recommendations generated` })
    logger.info('Insights refreshed', { count: newInsights.length })
    announce('Insights refreshed', 'polite')
    setIsRefreshing(false)
  }, [announce])

  // Export insights
  const handleExportInsights = useCallback(() => {
    const exportData = {
      insights: insights.map(i => ({
        ...i,
        status: appliedInsights.has(i.id) ? 'applied' : dismissedInsights.has(i.id) ? 'dismissed' : 'pending'
      })),
      exportedAt: new Date().toISOString(),
      summary: {
        total: insights.length,
        applied: appliedInsights.size,
        dismissed: dismissedInsights.size,
        pending: insights.length - appliedInsights.size - dismissedInsights.size
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Insights Exported')
    logger.info('Insights exported')
  }, [insights, appliedInsights, dismissedInsights])

  // Filter insights
  const filteredInsights = insights.filter(i => {
    if (dismissedInsights.has(i.id)) return false
    if (filterType === 'all') return true
    return i.type === filterType
  })

  // Stats
  const stats = {
    total: insights.length,
    applied: appliedInsights.size,
    highPriority: insights.filter(i => i.priority === 'high' && !dismissedInsights.has(i.id)).length
  }

  // Get icon for type
  const getIcon = (type: string) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-6 w-6" />
      case 'schedule': return <Calendar className="h-6 w-6" />
      case 'health': return <Activity className="h-6 w-6" />
      case 'optimization': return <Zap className="h-6 w-6" />
      default: return <Sparkles className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">AI Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized recommendations to optimize your workflow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportInsights}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefreshInsights} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Insights</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Applied</p>
          <p className="text-2xl font-bold text-green-600">{stats.applied}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
          <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="optimization">Optimization</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">
          Showing {filteredInsights.length} of {insights.length - dismissedInsights.size} insights
        </span>
      </div>

      {/* Insights List */}
      <div className="grid gap-6">
        {filteredInsights.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No insights match your filter</p>
            <Button variant="link" onClick={() => setFilterType('all')}>
              Show all insights
            </Button>
          </Card>
        ) : (
          filteredInsights.map(insight => {
            const isApplied = appliedInsights.has(insight.id)
            const styles = TYPE_STYLES[insight.type] || TYPE_STYLES.productivity

            return (
              <Card
                key={insight.id}
                className={cn(
                  "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg transition-all",
                  isApplied && "opacity-60"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", styles.bg, styles.darkBg)}>
                      <div className={styles.iconColor}>
                        {getIcon(insight.type)}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-semibold text-gray-900 dark:text-gray-100",
                            isApplied && "line-through"
                          )}>
                            {insight.title}
                          </h3>
                          <Badge variant="outline" className={cn("text-xs capitalize", PRIORITY_STYLES[insight.priority])}>
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {insight.type}
                          </Badge>
                          {isApplied && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Applied
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          onClick={() => handleDismissInsight(insight.id)}
                          title="Dismiss"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>

                      {insight.actionable && !isApplied && (
                        <Button
                          data-testid="apply-suggestion-btn"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleApplyAISuggestion(insight.id)}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Apply Suggestion
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
