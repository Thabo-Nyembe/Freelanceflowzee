/**
 * ML Insights Utilities
 * Mock data, helpers, and utilities for machine learning insights
 */

import {
  MLInsight,
  TrendAnalysis,
  AnomalyDetection,
  RecommendationEngine,
  ChurnPrediction,
  MetricCategory,
  PredictionConfidence
} from './ml-insights-types'

// Mock ML Insights
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_INSIGHTS: MLInsight[] = []

// Mock Trend Analysis
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_TRENDS: TrendAnalysis[] = []

// Mock Anomalies
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_ANOMALIES: AnomalyDetection[] = []

// Mock Recommendations
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_RECOMMENDATIONS: RecommendationEngine[] = []

// Mock Churn Predictions
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_CHURN_PREDICTIONS: ChurnPrediction[] = []

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

/**
 * Get confidence color
 */
export function getConfidenceColor(confidence: PredictionConfidence): string {
  const colors = {
    'low': 'red',
    'medium': 'yellow',
    'high': 'green',
    'very-high': 'blue'
  }
  return colors[confidence]
}

/**
 * Get impact color
 */
export function getImpactColor(impact: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'gray',
    medium: 'orange',
    high: 'red'
  }
  return colors[impact]
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): string {
  const colors = {
    info: 'blue',
    warning: 'yellow',
    critical: 'red'
  }
  return colors[severity as keyof typeof colors] || 'gray'
}

/**
 * Calculate confidence score as percentage
 */
export function confidenceToPercentage(confidence: PredictionConfidence): number {
  const scores = {
    'low': 40,
    'medium': 65,
    'high': 85,
    'very-high': 95
  }
  return scores[confidence]
}

/**
 * Get metric category icon
 */
export function getCategoryIcon(category: MetricCategory): string {
  const icons = {
    revenue: 'DollarSign',
    users: 'Users',
    performance: 'Zap',
    engagement: 'Heart',
    conversion: 'TrendingUp',
    retention: 'Shield',
    churn: 'AlertTriangle'
  }
  return icons[category]
}

/**
 * Format time range label
 */
export function formatTimeRange(range: string): string {
  const labels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Last Year',
    'all': 'All Time'
  }
  return labels[range as keyof typeof labels] || range
}

/**
 * Generate mock forecast data
 */
export function generateForecastData(
  baseValue: number,
  days: number,
  growth: number
): Array<{ date: Date; value: number; predicted: boolean }> {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000),
    value: baseValue + (baseValue * growth * i) / 100 + Math.random() * baseValue * 0.1,
    predicted: true
  }))
}

/**
 * Calculate trend direction from data points
 */
export function calculateTrendDirection(
  dataPoints: Array<{ value: number }>
): 'up' | 'down' | 'stable' {
  if (dataPoints.length < 2) return 'stable'

  const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2))
  const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2))

  const avgFirst = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length

  const diff = ((avgSecond - avgFirst) / avgFirst) * 100

  if (diff > 5) return 'up'
  if (diff < -5) return 'down'
  return 'stable'
}

/**
 * Get risk level color
 */
export function getRiskColor(risk: string): string {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  }
  return colors[risk as keyof typeof colors] || 'gray'
}
