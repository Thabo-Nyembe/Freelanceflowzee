/**
 * ML Insights Types
 * World-class type definitions for machine learning insights and predictions
 */

export type InsightType =
  | 'trend'
  | 'anomaly'
  | 'forecast'
  | 'pattern'
  | 'recommendation'
  | 'alert'

export type MetricCategory =
  | 'revenue'
  | 'users'
  | 'performance'
  | 'engagement'
  | 'conversion'
  | 'retention'
  | 'churn'

export type PredictionConfidence = 'low' | 'medium' | 'high' | 'very-high'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export interface MLInsight {
  id: string
  type: InsightType
  category: MetricCategory
  title: string
  description: string
  confidence: PredictionConfidence
  impact: 'low' | 'medium' | 'high'
  actionable: boolean
  recommendations: string[]
  metadata: {
    detectedAt: Date
    expiresAt?: Date
    affectedMetrics: string[]
    dataPoints: number
    accuracy: number
  }
}

export interface TrendAnalysis {
  metric: string
  category: MetricCategory
  direction: 'up' | 'down' | 'stable'
  velocity: number
  confidence: PredictionConfidence
  dataPoints: Array<{
    date: Date
    value: number
    predicted?: boolean
  }>
  insights: string[]
  forecast: {
    next7Days: number
    next30Days: number
    next90Days: number
    confidence: PredictionConfidence
  }
}

export interface AnomalyDetection {
  id: string
  metric: string
  category: MetricCategory
  timestamp: Date
  expectedValue: number
  actualValue: number
  deviation: number
  severity: AlertSeverity
  description: string
  possibleCauses: string[]
  recommendedActions: string[]
  resolved: boolean
}

export interface PatternRecognition {
  id: string
  name: string
  category: MetricCategory
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  confidence: PredictionConfidence
  occurrences: Array<{
    date: Date
    strength: number
  }>
  nextOccurrence?: {
    date: Date
    probability: number
  }
  insights: string[]
}

export interface PredictiveModel {
  id: string
  name: string
  category: MetricCategory
  algorithm: 'linear-regression' | 'random-forest' | 'neural-network' | 'time-series'
  accuracy: number
  lastTrained: Date
  features: string[]
  predictions: Array<{
    date: Date
    value: number
    confidenceInterval: {
      lower: number
      upper: number
    }
  }>
  performanceMetrics: {
    mse: number
    rmse: number
    mae: number
    r2Score: number
  }
}

export interface RecommendationEngine {
  id: string
  category: MetricCategory
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  expectedImpact: {
    metric: string
    improvement: number
    timeframe: string
  }
  actions: Array<{
    id: string
    title: string
    description: string
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    status: 'pending' | 'in-progress' | 'completed' | 'dismissed'
  }>
  basedOn: string[]
  confidence: PredictionConfidence
  createdAt: Date
}

export interface MetricCorrelation {
  metric1: string
  metric2: string
  correlation: number
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  direction: 'positive' | 'negative'
  significance: number
  description: string
  insights: string[]
}

export interface ChurnPrediction {
  userId: string
  userName: string
  churnProbability: number
  risk: 'low' | 'medium' | 'high' | 'critical'
  factors: Array<{
    factor: string
    impact: number
    description: string
  }>
  recommendations: string[]
  retentionScore: number
  predictedChurnDate?: Date
  confidence: PredictionConfidence
}

export interface RevenueForecasting {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  current: number
  predicted: number
  variance: number
  confidence: PredictionConfidence
  breakdown: Array<{
    source: string
    current: number
    predicted: number
    growth: number
  }>
  seasonality: {
    detected: boolean
    pattern?: string
    peakPeriods?: string[]
  }
  trends: string[]
}

export interface UserSegmentation {
  segmentId: string
  name: string
  description: string
  size: number
  percentage: number
  characteristics: Record<string, any>
  behavior: {
    avgSessionDuration: number
    avgRevenue: number
    conversionRate: number
    churnRate: number
    engagement: number
  }
  trends: Array<{
    metric: string
    direction: 'up' | 'down' | 'stable'
    value: number
  }>
  recommendations: string[]
}

export interface MLDashboard {
  id: string
  name: string
  description: string
  widgets: MLWidget[]
  refreshInterval: number
  lastUpdated: Date
  owner: string
  shared: boolean
}

export interface MLWidget {
  id: string
  type: 'insight' | 'trend' | 'forecast' | 'anomaly' | 'recommendation' | 'correlation'
  title: string
  category: MetricCategory
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: Record<string, any>
  data: any
}

export interface MLAlert {
  id: string
  type: InsightType
  severity: AlertSeverity
  metric: string
  category: MetricCategory
  message: string
  details: string
  threshold: number
  actualValue: number
  timestamp: Date
  acknowledged: boolean
  actions: string[]
}

export interface PerformanceMetrics {
  model: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  trainingTime: number
  predictionTime: number
  dataSize: number
  features: number
}
