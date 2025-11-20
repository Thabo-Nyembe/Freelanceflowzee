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
export const MOCK_INSIGHTS: MLInsight[] = [
  {
    id: 'insight-1',
    type: 'trend',
    category: 'revenue',
    title: 'Revenue Growth Accelerating',
    description: 'Revenue is growing 23% faster than the previous quarter. This trend is likely to continue based on seasonal patterns.',
    confidence: 'high',
    impact: 'high',
    actionable: true,
    recommendations: [
      'Increase marketing budget to capitalize on momentum',
      'Prepare inventory for increased demand',
      'Consider scaling team to handle growth'
    ],
    metadata: {
      detectedAt: new Date(),
      affectedMetrics: ['revenue', 'conversion_rate', 'user_growth'],
      dataPoints: 90,
      accuracy: 0.89
    }
  },
  {
    id: 'insight-2',
    type: 'anomaly',
    category: 'users',
    title: 'Unusual Drop in User Engagement',
    description: 'User engagement dropped 15% yesterday compared to the 30-day average. This appears to be related to a recent UI change.',
    confidence: 'very-high',
    impact: 'medium',
    actionable: true,
    recommendations: [
      'Review recent UI/UX changes',
      'Conduct user surveys to gather feedback',
      'Consider rolling back recent updates'
    ],
    metadata: {
      detectedAt: new Date(Date.now() - 86400000),
      affectedMetrics: ['session_duration', 'page_views', 'bounce_rate'],
      dataPoints: 30,
      accuracy: 0.94
    }
  },
  {
    id: 'insight-3',
    type: 'forecast',
    category: 'conversion',
    title: 'Conversion Rate Improvement Expected',
    description: 'Based on current trends and recent optimizations, conversion rate is predicted to increase by 8-12% over the next 30 days.',
    confidence: 'medium',
    impact: 'high',
    actionable: false,
    recommendations: [
      'Monitor A/B test results closely',
      'Document successful strategies',
      'Prepare for increased transaction volume'
    ],
    metadata: {
      detectedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 86400000),
      affectedMetrics: ['conversion_rate', 'revenue', 'customer_acquisition'],
      dataPoints: 60,
      accuracy: 0.82
    }
  },
  {
    id: 'insight-4',
    type: 'recommendation',
    category: 'retention',
    title: 'Implement Retention Campaign',
    description: 'ML models identify a high-value user segment at risk of churning. A targeted retention campaign could save $45K in revenue.',
    confidence: 'high',
    impact: 'high',
    actionable: true,
    recommendations: [
      'Send personalized re-engagement emails',
      'Offer limited-time discounts to at-risk users',
      'Schedule customer success calls with high-value accounts'
    ],
    metadata: {
      detectedAt: new Date(),
      affectedMetrics: ['churn_rate', 'ltv', 'retention_rate'],
      dataPoints: 120,
      accuracy: 0.87
    }
  }
]

// Mock Trend Analysis
export const MOCK_TRENDS: TrendAnalysis[] = [
  {
    metric: 'Monthly Recurring Revenue',
    category: 'revenue',
    direction: 'up',
    velocity: 12.5,
    confidence: 'high',
    dataPoints: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000),
      value: 50000 + Math.random() * 10000 + i * 1000
    })),
    insights: [
      'Steady growth over the past month',
      'New customer acquisition is the primary driver',
      'Expansion revenue increasing consistently'
    ],
    forecast: {
      next7Days: 65000,
      next30Days: 72000,
      next90Days: 85000,
      confidence: 'high'
    }
  },
  {
    metric: 'Active Users',
    category: 'users',
    direction: 'up',
    velocity: 8.3,
    confidence: 'very-high',
    dataPoints: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000),
      value: 1000 + Math.random() * 200 + i * 25
    })),
    insights: [
      'User base growing steadily',
      'Retention rates improving',
      'Viral coefficient increasing'
    ],
    forecast: {
      next7Days: 1800,
      next30Days: 2200,
      next90Days: 3000,
      confidence: 'high'
    }
  }
]

// Mock Anomalies
export const MOCK_ANOMALIES: AnomalyDetection[] = [
  {
    id: 'anomaly-1',
    metric: 'API Response Time',
    category: 'performance',
    timestamp: new Date(Date.now() - 3600000),
    expectedValue: 250,
    actualValue: 1200,
    deviation: 380,
    severity: 'critical',
    description: 'API response time spiked to 1200ms, 380% above the expected 250ms.',
    possibleCauses: [
      'Database query optimization needed',
      'Increased traffic load',
      'External API dependency slowdown'
    ],
    recommendedActions: [
      'Investigate database query performance',
      'Review recent code deployments',
      'Check external API status'
    ],
    resolved: false
  },
  {
    id: 'anomaly-2',
    metric: 'Checkout Abandonment',
    category: 'conversion',
    timestamp: new Date(Date.now() - 7200000),
    expectedValue: 35,
    actualValue: 58,
    deviation: 65.7,
    severity: 'warning',
    description: 'Checkout abandonment rate increased to 58%, significantly higher than the expected 35%.',
    possibleCauses: [
      'Payment gateway issues',
      'Unexpected shipping costs',
      'Form validation errors'
    ],
    recommendedActions: [
      'Test checkout flow for errors',
      'Review payment processing logs',
      'Analyze user session recordings'
    ],
    resolved: false
  }
]

// Mock Recommendations
export const MOCK_RECOMMENDATIONS: RecommendationEngine[] = [
  {
    id: 'rec-1',
    category: 'revenue',
    title: 'Optimize Pricing Strategy',
    description: 'ML analysis suggests adjusting pricing tiers could increase revenue by 15-20% without significant churn risk.',
    priority: 'high',
    expectedImpact: {
      metric: 'Monthly Revenue',
      improvement: 18,
      timeframe: '90 days'
    },
    actions: [
      {
        id: 'action-1',
        title: 'Conduct price sensitivity analysis',
        description: 'Use Van Westendorp analysis to determine optimal price points',
        effort: 'medium',
        impact: 'high',
        status: 'pending'
      },
      {
        id: 'action-2',
        title: 'A/B test new pricing tiers',
        description: 'Test revised pricing with 20% of user base',
        effort: 'low',
        impact: 'high',
        status: 'pending'
      },
      {
        id: 'action-3',
        title: 'Implement grandfathering for existing customers',
        description: 'Protect existing customer relationships during transition',
        effort: 'low',
        impact: 'medium',
        status: 'pending'
      }
    ],
    basedOn: ['historical_pricing_data', 'competitor_analysis', 'customer_segmentation'],
    confidence: 'high',
    createdAt: new Date()
  },
  {
    id: 'rec-2',
    category: 'engagement',
    title: 'Personalize User Onboarding',
    description: 'Users completing personalized onboarding have 3x higher retention. Implement adaptive onboarding flows.',
    priority: 'medium',
    expectedImpact: {
      metric: 'Day 7 Retention',
      improvement: 25,
      timeframe: '60 days'
    },
    actions: [
      {
        id: 'action-4',
        title: 'Segment users by use case',
        description: 'Create 4-5 distinct user personas',
        effort: 'medium',
        impact: 'high',
        status: 'in-progress'
      },
      {
        id: 'action-5',
        title: 'Build adaptive onboarding flows',
        description: 'Create custom onboarding for each persona',
        effort: 'high',
        impact: 'high',
        status: 'pending'
      }
    ],
    basedOn: ['user_behavior_analysis', 'cohort_analysis', 'feature_usage'],
    confidence: 'medium',
    createdAt: new Date()
  }
]

// Mock Churn Predictions
export const MOCK_CHURN_PREDICTIONS: ChurnPrediction[] = [
  {
    userId: 'user_789',
    userName: 'Acme Corp',
    churnProbability: 0.78,
    risk: 'critical',
    factors: [
      { factor: 'Decreased login frequency', impact: 0.35, description: 'Logins down 65% in past 30 days' },
      { factor: 'Low feature adoption', impact: 0.25, description: 'Using only 2 of 10 key features' },
      { factor: 'Support ticket volume', impact: 0.18, description: '3 unresolved issues in past week' }
    ],
    recommendations: [
      'Schedule immediate customer success call',
      'Offer personalized training session',
      'Provide discount on annual upgrade'
    ],
    retentionScore: 22,
    predictedChurnDate: new Date(Date.now() + 14 * 86400000),
    confidence: 'high'
  },
  {
    userId: 'user_456',
    userName: 'TechStart Inc',
    churnProbability: 0.45,
    risk: 'medium',
    factors: [
      { factor: 'Billing issues', impact: 0.30, description: 'Payment failed twice in past month' },
      { factor: 'Support response time', impact: 0.15, description: 'Average response time 24hrs+' }
    ],
    recommendations: [
      'Proactively reach out about billing',
      'Offer payment plan options',
      'Fast-track support tickets'
    ],
    retentionScore: 55,
    confidence: 'medium'
  }
]

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
