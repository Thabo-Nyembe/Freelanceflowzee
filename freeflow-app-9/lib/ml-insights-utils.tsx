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

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('MLInsightsUtils')

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
// MOCK DATA
// ============================================================================

export const MOCK_ML_INSIGHTS: MLInsight[] = [
  {
    id: 'INS-001',
    userId: 'USR-001',
    title: 'Revenue Growth Trend Detected',
    type: 'trend',
    category: 'revenue',
    description: 'Revenue is trending upward by 23% over the past 30 days. This trend is expected to continue based on current trajectory.',
    confidence: 'very-high',
    impact: 'high',
    severity: 'info',
    actionable: true,
    recommendations: [
      'Increase marketing spend to capitalize on momentum',
      'Prepare infrastructure for anticipated growth',
      'Consider expanding team to handle increased demand'
    ],
    dataSource: 'Revenue Analytics',
    modelName: 'Revenue Forecast Model',
    modelVersion: 'v2.3.1',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    tags: ['revenue', 'growth', 'positive'],
    metrics: {
      accuracy: 94.5,
      precision: 92.8,
      recall: 95.2,
      f1Score: 93.9
    },
    affectedUsers: 1247,
    potentialRevenue: 45000,
    priority: 1,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-002',
    userId: 'USR-001',
    title: 'Anomaly in User Engagement',
    type: 'anomaly',
    category: 'engagement',
    description: 'Unusual spike in user engagement detected on Feb 14th. Activity was 340% above normal levels.',
    confidence: 'high',
    impact: 'medium',
    severity: 'warning',
    actionable: true,
    recommendations: [
      'Investigate what caused the spike',
      'Analyze if this was a positive or negative event',
      'Consider replicating successful engagement strategies'
    ],
    dataSource: 'User Activity Logs',
    modelName: 'Anomaly Detection Model',
    modelVersion: 'v1.8.4',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-02-14'),
    tags: ['engagement', 'anomaly', 'spike'],
    metrics: {
      accuracy: 91.2,
      precision: 89.5,
      recall: 93.1,
      f1Score: 91.2
    },
    affectedUsers: 3421,
    priority: 2,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-003',
    userId: 'USR-001',
    title: 'Client Retention Risk',
    type: 'alert',
    category: 'retention',
    description: '12 high-value clients are showing signs of churn risk based on decreased engagement patterns.',
    confidence: 'high',
    impact: 'critical',
    severity: 'error',
    actionable: true,
    recommendations: [
      'Reach out to at-risk clients within 48 hours',
      'Offer personalized incentives or solutions',
      'Schedule check-in calls with account managers',
      'Review and address any service issues'
    ],
    dataSource: 'Client Behavior Analysis',
    modelName: 'Churn Prediction Model',
    modelVersion: 'v3.1.2',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-16'),
    updatedAt: new Date('2024-02-16'),
    tags: ['retention', 'churn', 'urgent'],
    metrics: {
      accuracy: 87.3,
      precision: 85.6,
      recall: 89.2,
      f1Score: 87.3
    },
    affectedUsers: 12,
    potentialRevenue: -85000, // negative = potential loss
    priority: 1,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-004',
    userId: 'USR-001',
    title: 'Project Completion Rate Forecast',
    type: 'forecast',
    category: 'performance',
    description: 'Based on current trends, project completion rate will reach 95% by end of Q1 2024.',
    confidence: 'high',
    impact: 'medium',
    severity: 'info',
    actionable: true,
    recommendations: [
      'Maintain current workflow processes',
      'Document successful strategies for team knowledge base',
      'Set new target of 97% for Q2'
    ],
    dataSource: 'Project Management Data',
    modelName: 'Performance Forecast Model',
    modelVersion: 'v2.0.8',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    tags: ['performance', 'forecast', 'positive'],
    metrics: {
      accuracy: 88.7,
      precision: 87.2,
      recall: 90.1,
      f1Score: 88.6
    },
    priority: 3,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-005',
    userId: 'USR-001',
    title: 'Recurring Pattern in Support Tickets',
    type: 'pattern',
    category: 'quality',
    description: 'Support tickets spike every Monday at 9 AM. Pattern detected across 8 consecutive weeks.',
    confidence: 'very-high',
    impact: 'low',
    severity: 'info',
    actionable: true,
    recommendations: [
      'Increase support staff coverage on Monday mornings',
      'Implement proactive communication on Sunday evenings',
      'Create self-service resources for common Monday issues'
    ],
    dataSource: 'Support Ticket System',
    modelName: 'Pattern Recognition Model',
    modelVersion: 'v1.5.3',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12'),
    tags: ['support', 'pattern', 'timing'],
    metrics: {
      accuracy: 96.1,
      precision: 94.8,
      recall: 97.3,
      f1Score: 96.0
    },
    priority: 4,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-006',
    userId: 'USR-001',
    title: 'Optimize Pricing Strategy',
    type: 'recommendation',
    category: 'revenue',
    description: 'Analysis suggests a 15% price increase for premium services would increase net revenue by $32K annually with minimal churn impact.',
    confidence: 'high',
    impact: 'high',
    severity: 'info',
    actionable: true,
    recommendations: [
      'Implement gradual 15% price increase over 2 months',
      'Grandfather existing clients for 6 months',
      'Enhance premium features to justify increase',
      'Communicate value proposition clearly'
    ],
    dataSource: 'Pricing & Revenue Analysis',
    modelName: 'Pricing Optimization Model',
    modelVersion: 'v2.7.1',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-08'),
    tags: ['pricing', 'revenue', 'optimization'],
    metrics: {
      accuracy: 82.4,
      precision: 80.1,
      recall: 84.6,
      f1Score: 82.3
    },
    potentialRevenue: 32000,
    priority: 2,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-007',
    userId: 'USR-001',
    title: 'Seasonal Revenue Pattern',
    type: 'pattern',
    category: 'revenue',
    description: 'Revenue consistently increases 40% in Q4. Pattern observed for 3 consecutive years.',
    confidence: 'very-high',
    impact: 'high',
    severity: 'info',
    actionable: true,
    recommendations: [
      'Plan for increased capacity in Q4',
      'Build cash reserves in Q3 for Q4 opportunities',
      'Launch marketing campaigns in early Q4'
    ],
    dataSource: 'Historical Revenue Data',
    modelName: 'Seasonal Analysis Model',
    modelVersion: 'v1.9.2',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    tags: ['seasonal', 'revenue', 'planning'],
    metrics: {
      accuracy: 93.8,
      precision: 92.3,
      recall: 95.2,
      f1Score: 93.7
    },
    priority: 3,
    dismissed: false,
    implemented: false
  },
  {
    id: 'INS-008',
    userId: 'USR-001',
    title: 'Quality Score Declining',
    type: 'trend',
    category: 'quality',
    description: 'Average project quality score has decreased 8% over the past 2 months.',
    confidence: 'high',
    impact: 'high',
    severity: 'warning',
    actionable: true,
    recommendations: [
      'Review recent project deliverables',
      'Increase QA checkpoints in workflow',
      'Provide additional training to team',
      'Gather client feedback on quality concerns'
    ],
    dataSource: 'Quality Assurance Metrics',
    modelName: 'Quality Trend Model',
    modelVersion: 'v1.3.7',
    modelStatus: 'ready',
    createdAt: new Date('2024-02-17'),
    updatedAt: new Date('2024-02-17'),
    tags: ['quality', 'decline', 'attention-needed'],
    metrics: {
      accuracy: 89.5,
      precision: 87.9,
      recall: 91.1,
      f1Score: 89.4
    },
    affectedUsers: 45,
    priority: 1,
    dismissed: false,
    implemented: false
  }
]

export const MOCK_ML_MODELS: MLModel[] = [
  {
    id: 'MDL-001',
    name: 'Revenue Forecast Model',
    version: 'v2.3.1',
    type: 'Time Series Forecasting',
    status: 'ready',
    accuracy: 94.5,
    trainingDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-02-01'),
    datasetSize: 12847,
    features: ['historical_revenue', 'client_count', 'project_count', 'seasonality', 'market_trends'],
    hyperparameters: {
      learningRate: 0.001,
      epochs: 500,
      batchSize: 32,
      hiddenLayers: [128, 64, 32]
    }
  },
  {
    id: 'MDL-002',
    name: 'Anomaly Detection Model',
    version: 'v1.8.4',
    type: 'Isolation Forest',
    status: 'ready',
    accuracy: 91.2,
    trainingDate: new Date('2024-01-20'),
    lastUpdated: new Date('2024-02-05'),
    datasetSize: 45632,
    features: ['user_activity', 'session_duration', 'feature_usage', 'time_of_day'],
    hyperparameters: {
      contamination: 0.1,
      maxSamples: 256,
      nEstimators: 100
    }
  },
  {
    id: 'MDL-003',
    name: 'Churn Prediction Model',
    version: 'v3.1.2',
    type: 'Gradient Boosting',
    status: 'ready',
    accuracy: 87.3,
    trainingDate: new Date('2024-02-01'),
    lastUpdated: new Date('2024-02-10'),
    datasetSize: 8934,
    features: ['engagement_score', 'last_activity', 'support_tickets', 'payment_history', 'feature_adoption'],
    hyperparameters: {
      nEstimators: 200,
      maxDepth: 6,
      learningRate: 0.1,
      minSamplesLeaf: 5
    }
  }
]

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
  mockInsights: MOCK_ML_INSIGHTS.length,
  mockModels: MOCK_ML_MODELS.length
})
