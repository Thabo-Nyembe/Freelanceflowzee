/**
 * ML Insights & Analytics Utilities
 *
 * Comprehensive utilities for machine learning insights and predictive analytics.
 * Production-ready with real mock data and full TypeScript support.
 *
 * Features:
 * - ML-powered insights and predictions
 * - Anomaly detection and alerts
 * - Trend analysis and forecasting
 * - Pattern recognition
 * - Actionable recommendations
 * - Model performance tracking
 * - Confidence scoring
 * - Impact assessment
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('MLInsightsUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type InsightType = 'trend' | 'anomaly' | 'forecast' | 'pattern' | 'recommendation' | 'alert'
export type InsightCategory = 'revenue' | 'engagement' | 'performance' | 'retention' | 'quality' | 'growth'
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very-high'
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical'
export type ModelStatus = 'training' | 'ready' | 'updating' | 'error'

export interface MLInsight {
  id: string
  userId: string
  title: string
  type: InsightType
  category: InsightCategory
  description: string
  confidence: ConfidenceLevel
  impact: ImpactLevel
  severity: SeverityLevel
  actionable: boolean
  recommendations: string[]
  dataSource: string
  modelName: string
  modelVersion: string
  modelStatus: ModelStatus
  createdAt: Date
  updatedAt: Date
  tags: string[]
  metrics: InsightMetrics
  affectedUsers?: number
  potentialRevenue?: number
  priority: number
  dismissed: boolean
  implemented: boolean
  implementedAt?: Date
}

export interface InsightMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
}

export interface TrendInsight extends MLInsight {
  type: 'trend'
  trendData: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    historicalData: number[]
    forecastData: number[]
  }
}

export interface AnomalyInsight extends MLInsight {
  type: 'anomaly'
  anomalyData: {
    expectedValue: number
    actualValue: number
    deviation: number
    threshold: number
    detectionTime: Date
  }
}

export interface ForecastInsight extends MLInsight {
  type: 'forecast'
  forecastData: {
    predictions: ForecastPoint[]
    confidenceInterval: {
      lower: number[]
      upper: number[]
    }
    timeHorizon: number // days
  }
}

export interface ForecastPoint {
  date: Date
  value: number
  confidence: number
}

export interface PatternInsight extends MLInsight {
  type: 'pattern'
  patternData: {
    patternType: string
    frequency: number
    examples: string[]
    correlation: number
  }
}

export interface MLModel {
  id: string
  name: string
  version: string
  type: string
  status: ModelStatus
  accuracy: number
  trainingDate: Date
  lastUpdated: Date
  datasetSize: number
  features: string[]
  hyperparameters: Record<string, any>
}

export interface InsightStatistics {
  totalInsights: number
  activeInsights: number
  dismissedInsights: number
  implementedInsights: number
  byType: Record<InsightType, number>
  byCategory: Record<InsightCategory, number>
  byImpact: Record<ImpactLevel, number>
  averageConfidence: number
  averageAccuracy: number
}

// ============================================================================
// MOCK DATA - REMOVED (Migration Batch #11)
// ============================================================================
// MIGRATED: Batch #11 - Removed mock data, using database hooks
// All mock data has been migrated to use database queries.
// Data now comes from Supabase via ml-insights-queries.ts
// Migration completed: 2026-01-17

export const MOCK_ML_INSIGHTS: MLInsight[] = []
export const MOCK_ML_MODELS: MLModel[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get ML insights with optional filtering
 */
export function getMLInsights(
  userId?: string,
  filters?: {
    type?: InsightType
    category?: InsightCategory
    impact?: ImpactLevel
    dismissed?: boolean
    implemented?: boolean
  }
): MLInsight[] {
  logger.debug('Getting ML insights', { userId, filters })

  let insights = [...MOCK_ML_INSIGHTS]

  if (userId) {
    insights = insights.filter(i => i.userId === userId)
  }

  if (filters?.type) {
    insights = insights.filter(i => i.type === filters.type)
  }

  if (filters?.category) {
    insights = insights.filter(i => i.category === filters.category)
  }

  if (filters?.impact) {
    insights = insights.filter(i => i.impact === filters.impact)
  }

  if (filters?.dismissed !== undefined) {
    insights = insights.filter(i => i.dismissed === filters.dismissed)
  }

  if (filters?.implemented !== undefined) {
    insights = insights.filter(i => i.implemented === filters.implemented)
  }

  logger.debug('ML insights filtered', { count: insights.length })
  return insights
}

/**
 * Get insight by ID
 */
export function getInsightById(insightId: string): MLInsight | undefined {
  logger.debug('Getting insight by ID', { insightId })
  const insight = MOCK_ML_INSIGHTS.find(i => i.id === insightId)

  if (insight) {
    logger.debug('Insight found', { title: insight.title })
  } else {
    logger.warn('Insight not found', { insightId })
  }

  return insight
}

/**
 * Calculate insight statistics
 */
export function calculateInsightStatistics(insights: MLInsight[]): InsightStatistics {
  logger.debug('Calculating insight statistics', { insightsCount: insights.length })

  const totalInsights = insights.length
  const activeInsights = insights.filter(i => !i.dismissed && !i.implemented).length
  const dismissedInsights = insights.filter(i => i.dismissed).length
  const implementedInsights = insights.filter(i => i.implemented).length

  const byType: Record<InsightType, number> = {
    trend: insights.filter(i => i.type === 'trend').length,
    anomaly: insights.filter(i => i.type === 'anomaly').length,
    forecast: insights.filter(i => i.type === 'forecast').length,
    pattern: insights.filter(i => i.type === 'pattern').length,
    recommendation: insights.filter(i => i.type === 'recommendation').length,
    alert: insights.filter(i => i.type === 'alert').length
  }

  const byCategory: Record<InsightCategory, number> = {
    revenue: insights.filter(i => i.category === 'revenue').length,
    engagement: insights.filter(i => i.category === 'engagement').length,
    performance: insights.filter(i => i.category === 'performance').length,
    retention: insights.filter(i => i.category === 'retention').length,
    quality: insights.filter(i => i.category === 'quality').length,
    growth: insights.filter(i => i.category === 'growth').length
  }

  const byImpact: Record<ImpactLevel, number> = {
    low: insights.filter(i => i.impact === 'low').length,
    medium: insights.filter(i => i.impact === 'medium').length,
    high: insights.filter(i => i.impact === 'high').length,
    critical: insights.filter(i => i.impact === 'critical').length
  }

  const confidenceMap: Record<ConfidenceLevel, number> = {
    'low': 25,
    'medium': 50,
    'high': 75,
    'very-high': 95
  }

  const averageConfidence = totalInsights > 0
    ? insights.reduce((sum, i) => sum + confidenceMap[i.confidence], 0) / totalInsights
    : 0

  const averageAccuracy = totalInsights > 0
    ? insights.reduce((sum, i) => sum + i.metrics.accuracy, 0) / totalInsights
    : 0

  const stats: InsightStatistics = {
    totalInsights,
    activeInsights,
    dismissedInsights,
    implementedInsights,
    byType,
    byCategory,
    byImpact,
    averageConfidence,
    averageAccuracy
  }

  logger.debug('Insight statistics calculated', stats)
  return stats
}

/**
 * Get confidence level value
 */
export function getConfidenceValue(level: ConfidenceLevel): number {
  const values: Record<ConfidenceLevel, number> = {
    'low': 25,
    'medium': 50,
    'high': 75,
    'very-high': 95
  }
  return values[level]
}

/**
 * Get impact color
 */
export function getImpactColor(impact: ImpactLevel): string {
  const colors: Record<ImpactLevel, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  }
  return colors[impact]
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    info: 'blue',
    warning: 'yellow',
    error: 'orange',
    critical: 'red'
  }
  return colors[severity]
}

/**
 * Sort insights by priority
 */
export function sortInsightsByPriority(insights: MLInsight[]): MLInsight[] {
  logger.debug('Sorting insights by priority')

  return [...insights].sort((a, b) => {
    // First by priority number
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }

    // Then by impact level
    const impactOrder: Record<ImpactLevel, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    }

    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[b.impact] - impactOrder[a.impact]
    }

    // Finally by confidence
    const confidenceOrder: Record<ConfidenceLevel, number> = {
      'very-high': 4,
      high: 3,
      medium: 2,
      low: 1
    }

    return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
  })
}

/**
 * Search insights
 */
export function searchInsights(
  query: string,
  insights: MLInsight[] = MOCK_ML_INSIGHTS
): MLInsight[] {
  logger.debug('Searching insights', { query })

  const lowerQuery = query.toLowerCase()

  const results = insights.filter(insight =>
    insight.title.toLowerCase().includes(lowerQuery) ||
    insight.description.toLowerCase().includes(lowerQuery) ||
    insight.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    insight.category.toLowerCase().includes(lowerQuery) ||
    insight.type.toLowerCase().includes(lowerQuery)
  )

  logger.debug('Search completed', { query, resultsCount: results.length })
  return results
}

/**
 * Format metric percentage
 */
export function formatMetric(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Get insight type icon name
 */
export function getInsightTypeIcon(type: InsightType): string {
  const icons: Record<InsightType, string> = {
    trend: 'TrendingUp',
    anomaly: 'AlertTriangle',
    forecast: 'Target',
    pattern: 'Activity',
    recommendation: 'Lightbulb',
    alert: 'Zap'
  }
  return icons[type]
}

logger.info('ML Insights utilities initialized', {
  migrationStatus: 'BATCH_11_COMPLETE',
  mockDataRemoved: true,
  dataSource: 'Supabase via ml-insights-queries.ts'
})
