/**
 * AI CREATE A++++ - ANALYTICS UTILITY
 *
 * Provides comprehensive usage analytics and insights for AI content generation.
 * Tracks metrics, trends, costs, and performance over time.
 *
 * Features:
 * - Usage tracking (generations, tokens, costs)
 * - Model performance analysis
 * - Time-series analytics (hourly, daily, weekly, monthly)
 * - Cost analysis and forecasting
 * - Popular templates and prompts
 * - Export analytics reports
 *
 * @example
 * ```typescript
 * // Track a generation
 * trackGeneration({
 *   model: 'gpt-4o-mini',
 *   tokens: 1250,
 *   cost: 0.0025,
 *   responseTime: 2500,
 *   success: true
 * })
 *
 * // Get analytics summary
 * const analytics = getAnalyticsSummary('week')
 * console.log('Total cost this week:', analytics.totalCost)
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsEvent {
  id: string
  type: 'generation' | 'export' | 'template_use' | 'voice_input' | 'comparison' | 'version_save'
  timestamp: Date
  data: GenerationEventData | ExportEventData | TemplateEventData | VoiceEventData | ComparisonEventData | VersionEventData
}

export interface GenerationEventData {
  model: string
  tokens: number
  cost: number
  responseTime: number
  success: boolean
  errorType?: string
  contentType?: string
  promptLength?: number
}

export interface ExportEventData {
  format: string
  size: number
  generationId?: string
}

export interface TemplateEventData {
  templateId: string
  templateName: string
  category: string
}

export interface VoiceEventData {
  language: string
  duration: number
  wordCount: number
  confidence: number
}

export interface ComparisonEventData {
  models: string[]
  totalCost: number
  totalTime: number
  bestModel: string
}

export interface VersionEventData {
  generationId: string
  versionNumber: number
  changes: number
}

export interface AnalyticsSummary {
  period: TimePeriod
  startDate: Date
  endDate: Date
  metrics: AnalyticsMetrics
  modelStats: ModelStats[]
  templateStats: TemplateStats[]
  trends: TrendData
  insights: string[]
}

export interface AnalyticsMetrics {
  totalGenerations: number
  successfulGenerations: number
  failedGenerations: number
  totalTokens: number
  totalCost: number
  averageResponseTime: number
  totalExports: number
  totalComparisons: number
  totalVersions: number
}

export interface ModelStats {
  model: string
  generations: number
  tokens: number
  cost: number
  averageResponseTime: number
  successRate: number
}

export interface TemplateStats {
  templateId: string
  templateName: string
  uses: number
  averageCost: number
  averageTokens: number
}

export interface TrendData {
  generationsOverTime: DataPoint[]
  costsOverTime: DataPoint[]
  tokensOverTime: DataPoint[]
  successRateOverTime: DataPoint[]
}

export interface DataPoint {
  date: Date
  value: number
}

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all'

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = 'ai-create-analytics-events'
const MAX_EVENTS = 10000 // Keep last 10k events

/**
 * Tracks an analytics event
 */
export function trackEvent(type: AnalyticsEvent['type'], data: AnalyticsEvent['data']): string {
  try {
    const events = loadEvents()
    const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const event: AnalyticsEvent = {
      id,
      type,
      timestamp: new Date(),
      data
    }

    events.push(event)

    // Trim to max size
    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS)
    }

    saveEvents(events)
    return id
  } catch (error) {
    console.error('Failed to track event:', error)
    throw error
  }
}

/**
 * Convenience function to track generation
 */
export function trackGeneration(data: GenerationEventData): string {
  return trackEvent('generation', data)
}

/**
 * Convenience function to track export
 */
export function trackExport(data: ExportEventData): string {
  return trackEvent('export', data)
}

/**
 * Convenience function to track template use
 */
export function trackTemplateUse(data: TemplateEventData): string {
  return trackEvent('template_use', data)
}

/**
 * Convenience function to track voice input
 */
export function trackVoiceInput(data: VoiceEventData): string {
  return trackEvent('voice_input', data)
}

/**
 * Convenience function to track comparison
 */
export function trackComparison(data: ComparisonEventData): string {
  return trackEvent('comparison', data)
}

/**
 * Convenience function to track version save
 */
export function trackVersionSave(data: VersionEventData): string {
  return trackEvent('version_save', data)
}

/**
 * Loads all analytics events
 */
export function loadEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load analytics events:', error)
    return []
  }
}

/**
 * Saves analytics events
 */
function saveEvents(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Failed to save analytics events:', error)
    throw error
  }
}

/**
 * Clears all analytics events
 */
export function clearAnalytics(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear analytics:', error)
    return false
  }
}

// ============================================================================
// ANALYTICS SUMMARY
// ============================================================================

/**
 * Gets analytics summary for a time period
 */
export function getAnalyticsSummary(period: TimePeriod = 'all'): AnalyticsSummary {
  const events = loadEvents()
  const { startDate, endDate } = getDateRange(period)

  // Filter events by date range
  const filteredEvents = events.filter(event =>
    event.timestamp >= startDate && event.timestamp <= endDate
  )

  // Calculate metrics
  const metrics = calculateMetrics(filteredEvents)

  // Get model stats
  const modelStats = calculateModelStats(filteredEvents)

  // Get template stats
  const templateStats = calculateTemplateStats(filteredEvents)

  // Generate trends
  const trends = generateTrends(filteredEvents, period)

  // Generate insights
  const insights = generateInsights(metrics, modelStats, trends)

  return {
    period,
    startDate,
    endDate,
    metrics,
    modelStats,
    templateStats,
    trends,
    insights
  }
}

/**
 * Gets date range for time period
 */
function getDateRange(period: TimePeriod): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = now

  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'all':
      startDate = new Date(0) // Epoch
      break
    default:
      startDate = new Date(0)
  }

  return { startDate, endDate }
}

/**
 * Calculates overall metrics
 */
function calculateMetrics(events: AnalyticsEvent[]): AnalyticsMetrics {
  const generationEvents = events.filter(e => e.type === 'generation')
  const exportEvents = events.filter(e => e.type === 'export')
  const comparisonEvents = events.filter(e => e.type === 'comparison')
  const versionEvents = events.filter(e => e.type === 'version_save')

  let totalGenerations = 0
  let successfulGenerations = 0
  let failedGenerations = 0
  let totalTokens = 0
  let totalCost = 0
  let totalResponseTime = 0

  generationEvents.forEach(event => {
    const data = event.data as GenerationEventData
    totalGenerations++
    if (data.success) {
      successfulGenerations++
      totalTokens += data.tokens || 0
      totalCost += data.cost || 0
      totalResponseTime += data.responseTime || 0
    } else {
      failedGenerations++
    }
  })

  const averageResponseTime = successfulGenerations > 0
    ? totalResponseTime / successfulGenerations
    : 0

  return {
    totalGenerations,
    successfulGenerations,
    failedGenerations,
    totalTokens,
    totalCost,
    averageResponseTime,
    totalExports: exportEvents.length,
    totalComparisons: comparisonEvents.length,
    totalVersions: versionEvents.length
  }
}

/**
 * Calculates stats per model
 */
function calculateModelStats(events: AnalyticsEvent[]): ModelStats[] {
  const generationEvents = events.filter(e => e.type === 'generation')
  const modelMap = new Map<string, ModelStats>()

  generationEvents.forEach(event => {
    const data = event.data as GenerationEventData
    const model = data.model

    if (!modelMap.has(model)) {
      modelMap.set(model, {
        model,
        generations: 0,
        tokens: 0,
        cost: 0,
        averageResponseTime: 0,
        successRate: 0
      })
    }

    const stats = modelMap.get(model)!
    stats.generations++

    if (data.success) {
      stats.tokens += data.tokens || 0
      stats.cost += data.cost || 0
      stats.averageResponseTime += data.responseTime || 0
    }
  })

  // Calculate averages and success rates
  const modelStats = Array.from(modelMap.values())
  modelStats.forEach(stats => {
    const successfulGens = generationEvents.filter(e => {
      const data = e.data as GenerationEventData
      return data.model === stats.model && data.success
    }).length

    stats.successRate = stats.generations > 0
      ? (successfulGens / stats.generations) * 100
      : 0

    stats.averageResponseTime = successfulGens > 0
      ? stats.averageResponseTime / successfulGens
      : 0
  })

  // Sort by usage
  return modelStats.sort((a, b) => b.generations - a.generations)
}

/**
 * Calculates stats per template
 */
function calculateTemplateStats(events: AnalyticsEvent[]): TemplateStats[] {
  const templateEvents = events.filter(e => e.type === 'template_use')
  const templateMap = new Map<string, TemplateStats>()

  templateEvents.forEach(event => {
    const data = event.data as TemplateEventData
    const id = data.templateId

    if (!templateMap.has(id)) {
      templateMap.set(id, {
        templateId: id,
        templateName: data.templateName,
        uses: 0,
        averageCost: 0,
        averageTokens: 0
      })
    }

    const stats = templateMap.get(id)!
    stats.uses++
  })

  const templateStats = Array.from(templateMap.values())

  // Sort by usage
  return templateStats.sort((a, b) => b.uses - a.uses)
}

/**
 * Generates trend data over time
 */
function generateTrends(events: AnalyticsEvent[], period: TimePeriod): TrendData {
  const generationEvents = events.filter(e => e.type === 'generation')

  // Group by time bucket
  const bucketSize = getBucketSize(period)
  const buckets = groupByTimeBucket(generationEvents, bucketSize)

  const generationsOverTime: DataPoint[] = []
  const costsOverTime: DataPoint[] = []
  const tokensOverTime: DataPoint[] = []
  const successRateOverTime: DataPoint[] = []

  buckets.forEach((bucketEvents, bucketDate) => {
    const successfulEvents = bucketEvents.filter(e => (e.data as GenerationEventData).success)

    generationsOverTime.push({
      date: bucketDate,
      value: bucketEvents.length
    })

    const totalCost = successfulEvents.reduce((sum, e) =>
      sum + ((e.data as GenerationEventData).cost || 0), 0
    )
    costsOverTime.push({
      date: bucketDate,
      value: totalCost
    })

    const totalTokens = successfulEvents.reduce((sum, e) =>
      sum + ((e.data as GenerationEventData).tokens || 0), 0
    )
    tokensOverTime.push({
      date: bucketDate,
      value: totalTokens
    })

    const successRate = bucketEvents.length > 0
      ? (successfulEvents.length / bucketEvents.length) * 100
      : 0
    successRateOverTime.push({
      date: bucketDate,
      value: successRate
    })
  })

  return {
    generationsOverTime,
    costsOverTime,
    tokensOverTime,
    successRateOverTime
  }
}

/**
 * Gets bucket size (in milliseconds) for time period
 */
function getBucketSize(period: TimePeriod): number {
  switch (period) {
    case 'today':
      return 60 * 60 * 1000 // 1 hour
    case 'week':
      return 24 * 60 * 60 * 1000 // 1 day
    case 'month':
      return 24 * 60 * 60 * 1000 // 1 day
    case 'year':
      return 7 * 24 * 60 * 60 * 1000 // 1 week
    case 'all':
      return 30 * 24 * 60 * 60 * 1000 // 1 month
    default:
      return 24 * 60 * 60 * 1000
  }
}

/**
 * Groups events by time bucket
 */
function groupByTimeBucket(events: AnalyticsEvent[], bucketSize: number): Map<Date, AnalyticsEvent[]> {
  const buckets = new Map<Date, AnalyticsEvent[]>()

  events.forEach(event => {
    const bucketTime = Math.floor(event.timestamp.getTime() / bucketSize) * bucketSize
    const bucketDate = new Date(bucketTime)
    const key = bucketDate.toISOString()

    if (!buckets.has(bucketDate)) {
      buckets.set(bucketDate, [])
    }

    buckets.get(bucketDate)!.push(event)
  })

  return buckets
}

/**
 * Generates insights from analytics data
 */
function generateInsights(metrics: AnalyticsMetrics, modelStats: ModelStats[], trends: TrendData): string[] {
  const insights: string[] = []

  // Overall usage
  if (metrics.totalGenerations > 0) {
    insights.push(`📊 Total generations: ${metrics.totalGenerations} (${metrics.successfulGenerations} successful)`)
  }

  // Cost insights
  if (metrics.totalCost > 0) {
    insights.push(`💰 Total cost: $${metrics.totalCost.toFixed(4)}`)

    const avgCostPerGeneration = metrics.totalCost / metrics.successfulGenerations
    insights.push(`💵 Average cost per generation: $${avgCostPerGeneration.toFixed(6)}`)
  }

  // Performance insights
  if (metrics.averageResponseTime > 0) {
    const avgSeconds = (metrics.averageResponseTime / 1000).toFixed(1)
    insights.push(`⚡ Average response time: ${avgSeconds}s`)
  }

  // Model insights
  if (modelStats.length > 0) {
    const topModel = modelStats[0]
    insights.push(`🏆 Most used model: ${topModel.model} (${topModel.generations} generations)`)

    const bestSuccessRate = modelStats.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    )
    if (bestSuccessRate.successRate > 0) {
      insights.push(`✅ Best success rate: ${bestSuccessRate.model} (${bestSuccessRate.successRate.toFixed(1)}%)`)
    }
  }

  // Token usage
  if (metrics.totalTokens > 0) {
    const avgTokens = Math.floor(metrics.totalTokens / metrics.successfulGenerations)
    insights.push(`📝 Average tokens per generation: ${avgTokens.toLocaleString()}`)
  }

  // Trend insights
  if (trends.generationsOverTime.length >= 2) {
    const recent = trends.generationsOverTime.slice(-5).reduce((sum, dp) => sum + dp.value, 0)
    const earlier = trends.generationsOverTime.slice(0, 5).reduce((sum, dp) => sum + dp.value, 0)

    if (earlier > 0) {
      const growth = ((recent - earlier) / earlier) * 100
      if (growth > 10) {
        insights.push(`📈 Usage trending up: +${growth.toFixed(0)}% growth`)
      } else if (growth < -10) {
        insights.push(`📉 Usage trending down: ${growth.toFixed(0)}% decline`)
      }
    }
  }

  // Export usage
  if (metrics.totalExports > 0) {
    insights.push(`📤 Total exports: ${metrics.totalExports}`)
  }

  return insights
}

// ============================================================================
// EXPORT ANALYTICS
// ============================================================================

/**
 * Exports analytics summary as JSON
 */
export function exportAnalyticsJSON(summary: AnalyticsSummary): string {
  return JSON.stringify(summary, null, 2)
}

/**
 * Exports analytics summary as CSV
 */
export function exportAnalyticsCSV(summary: AnalyticsSummary): string {
  let csv = 'Metric,Value\n'

  // Overall metrics
  csv += `Total Generations,${summary.metrics.totalGenerations}\n`
  csv += `Successful Generations,${summary.metrics.successfulGenerations}\n`
  csv += `Failed Generations,${summary.metrics.failedGenerations}\n`
  csv += `Total Tokens,${summary.metrics.totalTokens}\n`
  csv += `Total Cost,$${summary.metrics.totalCost.toFixed(4)}\n`
  csv += `Average Response Time,${summary.metrics.averageResponseTime.toFixed(0)}ms\n`

  csv += '\n'
  csv += 'Model,Generations,Tokens,Cost,Avg Response Time,Success Rate\n'

  // Model stats
  summary.modelStats.forEach(stats => {
    csv += `${stats.model},${stats.generations},${stats.tokens},$${stats.cost.toFixed(4)},${stats.averageResponseTime.toFixed(0)}ms,${stats.successRate.toFixed(1)}%\n`
  })

  return csv
}

/**
 * Exports analytics summary as Markdown report
 */
export function exportAnalyticsMarkdown(summary: AnalyticsSummary): string {
  let md = `# AI Create Analytics Report\n\n`
  md += `**Period:** ${summary.period}\n`
  md += `**Date Range:** ${summary.startDate.toLocaleDateString()} - ${summary.endDate.toLocaleDateString()}\n\n`
  md += `---\n\n`

  md += `## 📊 Overall Metrics\n\n`
  md += `- **Total Generations:** ${summary.metrics.totalGenerations}\n`
  md += `- **Successful:** ${summary.metrics.successfulGenerations}\n`
  md += `- **Failed:** ${summary.metrics.failedGenerations}\n`
  md += `- **Success Rate:** ${((summary.metrics.successfulGenerations / summary.metrics.totalGenerations) * 100).toFixed(1)}%\n\n`

  md += `- **Total Tokens:** ${summary.metrics.totalTokens.toLocaleString()}\n`
  md += `- **Total Cost:** $${summary.metrics.totalCost.toFixed(4)}\n`
  md += `- **Avg Response Time:** ${summary.metrics.averageResponseTime.toFixed(0)}ms\n\n`

  md += `---\n\n`
  md += `## 🤖 Model Statistics\n\n`
  md += `| Model | Generations | Tokens | Cost | Avg Time | Success Rate |\n`
  md += `|-------|-------------|--------|------|----------|-------------|\n`

  summary.modelStats.forEach(stats => {
    md += `| ${stats.model} | ${stats.generations} | ${stats.tokens.toLocaleString()} | $${stats.cost.toFixed(4)} | ${stats.averageResponseTime.toFixed(0)}ms | ${stats.successRate.toFixed(1)}% |\n`
  })

  md += `\n---\n\n`
  md += `## 💡 Insights\n\n`

  summary.insights.forEach(insight => {
    md += `- ${insight}\n`
  })

  return md
}

// ============================================================================
// FORECASTING
// ============================================================================

/**
 * Forecasts cost for next period based on trends
 */
export function forecastCost(period: TimePeriod = 'month'): number {
  const summary = getAnalyticsSummary(period)

  if (summary.trends.costsOverTime.length < 2) {
    return 0
  }

  // Simple linear regression
  const costs = summary.trends.costsOverTime.map(dp => dp.value)
  const avgCost = costs.reduce((sum, c) => sum + c, 0) / costs.length

  // Assume linear trend continues
  const recentAvg = costs.slice(-3).reduce((sum, c) => sum + c, 0) / 3
  const growth = recentAvg - avgCost

  return Math.max(0, recentAvg + growth)
}

/**
 * Forecasts usage for next period
 */
export function forecastUsage(period: TimePeriod = 'month'): number {
  const summary = getAnalyticsSummary(period)

  if (summary.trends.generationsOverTime.length < 2) {
    return 0
  }

  const generations = summary.trends.generationsOverTime.map(dp => dp.value)
  const recentAvg = generations.slice(-3).reduce((sum, g) => sum + g, 0) / 3
  const avgGeneration = generations.reduce((sum, g) => sum + g, 0) / generations.length
  const growth = recentAvg - avgGeneration

  return Math.max(0, Math.round(recentAvg + growth))
}
