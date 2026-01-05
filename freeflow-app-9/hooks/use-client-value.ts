'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES - Client Lifetime Value & Relationship Management
// For Freelancers, Agencies, and Enterprises
// ============================================================================

export type ClientSegment = 'enterprise' | 'mid_market' | 'small_business' | 'startup' | 'individual'
export type ClientHealthStatus = 'thriving' | 'healthy' | 'at_risk' | 'churning' | 'churned'
export type EngagementLevel = 'highly_engaged' | 'engaged' | 'passive' | 'disengaged'

export interface ClientValueMetrics {
  id: string
  clientId: string
  clientName: string
  company?: string
  segment: ClientSegment
  industry?: string

  // Lifetime Value
  lifetimeValue: number // Total historical + projected future value
  historicalValue: number // Actual revenue received
  projectedValue: number // Expected future revenue
  ltvConfidence: number // 0-100% confidence in projection

  // Acquisition
  acquisitionDate: string
  acquisitionCost: number
  acquisitionChannel: string
  timeToFirstRevenue: number // days
  paybackPeriod: number // months to recover CAC

  // Revenue Metrics
  totalRevenue: number
  avgRevenuePerYear: number
  avgRevenuePerProject: number
  revenueGrowthRate: number
  monthlyRecurringRevenue: number
  expansionRevenue: number // upsells/cross-sells

  // Engagement Metrics
  projectCount: number
  activeProjectCount: number
  avgProjectsPerYear: number
  lastActivityDate: string
  daysSinceLastActivity: number
  engagementScore: number // 0-100
  engagementLevel: EngagementLevel

  // Health Metrics
  healthScore: number // 0-100
  healthStatus: ClientHealthStatus
  churnProbability: number
  churnRiskFactors: string[]
  satisfactionScore: number
  npsScore: number

  // Relationship Metrics
  relationshipLength: number // months
  contactFrequency: number // interactions per month
  responseTime: number // avg hours to respond
  meetingCount: number
  referralCount: number

  // Financial Health
  avgPaymentDays: number
  onTimePaymentRate: number
  outstandingBalance: number
  creditRisk: 'low' | 'medium' | 'high'

  // Opportunity
  upsellPotential: number // 0-100
  crossSellOpportunities: string[]
  nextBestAction: string
  estimatedAnnualPotential: number
}

export interface ClientCohort {
  id: string
  name: string
  description: string
  criteria: CohortCriteria
  clients: string[] // client IDs
  metrics: CohortMetrics
}

export interface CohortCriteria {
  segment?: ClientSegment[]
  industry?: string[]
  acquisitionDateRange?: { start: string; end: string }
  revenueRange?: { min: number; max: number }
  healthStatus?: ClientHealthStatus[]
}

export interface CohortMetrics {
  clientCount: number
  avgLTV: number
  totalLTV: number
  avgHealthScore: number
  avgChurnProbability: number
  retentionRate: number
  avgRevenuePerClient: number
  totalRevenue: number
}

export interface LTVAnalysis {
  currentLTV: number
  predictedLTV: number
  ltvBySegment: { segment: ClientSegment; avgLTV: number; count: number }[]
  ltvByIndustry: { industry: string; avgLTV: number; count: number }[]
  ltvTrend: { month: string; avgLTV: number }[]
  ltvDistribution: { range: string; count: number; percentage: number }[]
}

export interface ChurnAnalysis {
  overallChurnRate: number
  churnBySegment: { segment: ClientSegment; rate: number }[]
  churnByReason: { reason: string; count: number; percentage: number }[]
  churnPredictions: { clientId: string; clientName: string; probability: number; riskFactors: string[] }[]
  retentionStrategies: RetentionStrategy[]
}

export interface RetentionStrategy {
  id: string
  targetSegment: ClientSegment
  triggerCondition: string
  action: string
  estimatedImpact: number
  priority: 'high' | 'medium' | 'low'
  automated: boolean
}

export interface ClientInsight {
  id: string
  clientId: string
  type: 'opportunity' | 'risk' | 'milestone' | 'action_required'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionItems: string[]
  dueDate?: string
}

export interface ClientValueSummary {
  totalClients: number
  totalLTV: number
  avgLTV: number
  avgCAC: number
  ltvToCacRatio: number
  avgHealthScore: number
  atRiskClients: number
  churnRate: number
  retentionRate: number
  avgRelationshipLength: number
  topClientRevenue: number
  clientConcentrationRisk: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockClientMetrics: ClientValueMetrics[] = [
  {
    id: 'cv-1',
    clientId: 'client-1',
    clientName: 'TechCorp Inc',
    company: 'TechCorp Inc',
    segment: 'enterprise',
    industry: 'Technology',
    lifetimeValue: 450000,
    historicalValue: 125000,
    projectedValue: 325000,
    ltvConfidence: 85,
    acquisitionDate: '2022-06-15',
    acquisitionCost: 2500,
    acquisitionChannel: 'Referral',
    timeToFirstRevenue: 14,
    paybackPeriod: 1,
    totalRevenue: 125000,
    avgRevenuePerYear: 62500,
    avgRevenuePerProject: 31250,
    revenueGrowthRate: 45,
    monthlyRecurringRevenue: 5000,
    expansionRevenue: 35000,
    projectCount: 4,
    activeProjectCount: 1,
    avgProjectsPerYear: 2,
    lastActivityDate: '2024-03-18',
    daysSinceLastActivity: 2,
    engagementScore: 92,
    engagementLevel: 'highly_engaged',
    healthScore: 95,
    healthStatus: 'thriving',
    churnProbability: 5,
    churnRiskFactors: [],
    satisfactionScore: 95,
    npsScore: 9,
    relationshipLength: 21,
    contactFrequency: 8,
    responseTime: 2,
    meetingCount: 24,
    referralCount: 3,
    avgPaymentDays: 15,
    onTimePaymentRate: 100,
    outstandingBalance: 0,
    creditRisk: 'low',
    upsellPotential: 90,
    crossSellOpportunities: ['Maintenance retainer', 'Training services', 'Mobile app'],
    nextBestAction: 'Propose annual support contract',
    estimatedAnnualPotential: 120000
  },
  {
    id: 'cv-2',
    clientId: 'client-2',
    clientName: 'StartupXYZ',
    company: 'StartupXYZ',
    segment: 'startup',
    industry: 'FinTech',
    lifetimeValue: 180000,
    historicalValue: 65000,
    projectedValue: 115000,
    ltvConfidence: 60,
    acquisitionDate: '2023-08-01',
    acquisitionCost: 1800,
    acquisitionChannel: 'Inbound Marketing',
    timeToFirstRevenue: 21,
    paybackPeriod: 2,
    totalRevenue: 65000,
    avgRevenuePerYear: 65000,
    avgRevenuePerProject: 21666,
    revenueGrowthRate: 25,
    monthlyRecurringRevenue: 0,
    expansionRevenue: 12000,
    projectCount: 3,
    activeProjectCount: 1,
    avgProjectsPerYear: 3,
    lastActivityDate: '2024-03-15',
    daysSinceLastActivity: 5,
    engagementScore: 68,
    engagementLevel: 'engaged',
    healthScore: 65,
    healthStatus: 'at_risk',
    churnProbability: 35,
    churnRiskFactors: ['Budget constraints', 'Project delays', 'Scope disagreements'],
    satisfactionScore: 72,
    npsScore: 6,
    relationshipLength: 8,
    contactFrequency: 4,
    responseTime: 12,
    meetingCount: 8,
    referralCount: 0,
    avgPaymentDays: 45,
    onTimePaymentRate: 70,
    outstandingBalance: 8500,
    creditRisk: 'medium',
    upsellPotential: 40,
    crossSellOpportunities: ['Documentation services'],
    nextBestAction: 'Schedule relationship review meeting',
    estimatedAnnualPotential: 45000
  },
  {
    id: 'cv-3',
    clientId: 'client-3',
    clientName: 'Global Enterprises',
    company: 'Global Enterprises Ltd',
    segment: 'enterprise',
    industry: 'Manufacturing',
    lifetimeValue: 380000,
    historicalValue: 97500,
    projectedValue: 282500,
    ltvConfidence: 80,
    acquisitionDate: '2022-01-10',
    acquisitionCost: 3200,
    acquisitionChannel: 'Conference',
    timeToFirstRevenue: 30,
    paybackPeriod: 2,
    totalRevenue: 97500,
    avgRevenuePerYear: 45000,
    avgRevenuePerProject: 32500,
    revenueGrowthRate: 35,
    monthlyRecurringRevenue: 3500,
    expansionRevenue: 22000,
    projectCount: 3,
    activeProjectCount: 0,
    avgProjectsPerYear: 1.5,
    lastActivityDate: '2024-02-28',
    daysSinceLastActivity: 20,
    engagementScore: 75,
    engagementLevel: 'engaged',
    healthScore: 82,
    healthStatus: 'healthy',
    churnProbability: 15,
    churnRiskFactors: ['Low recent engagement'],
    satisfactionScore: 92,
    npsScore: 8,
    relationshipLength: 26,
    contactFrequency: 3,
    responseTime: 4,
    meetingCount: 18,
    referralCount: 2,
    avgPaymentDays: 21,
    onTimePaymentRate: 95,
    outstandingBalance: 0,
    creditRisk: 'low',
    upsellPotential: 85,
    crossSellOpportunities: ['System integration', 'Analytics dashboard', 'Training'],
    nextBestAction: 'Reach out to discuss Q2 projects',
    estimatedAnnualPotential: 85000
  }
]

const mockSummary: ClientValueSummary = {
  totalClients: 28,
  totalLTV: 4250000,
  avgLTV: 151786,
  avgCAC: 1850,
  ltvToCacRatio: 82,
  avgHealthScore: 78,
  atRiskClients: 4,
  churnRate: 7.1,
  retentionRate: 92.9,
  avgRelationshipLength: 18,
  topClientRevenue: 125000,
  clientConcentrationRisk: 28
}

const mockLTVAnalysis: LTVAnalysis = {
  currentLTV: 151786,
  predictedLTV: 185000,
  ltvBySegment: [
    { segment: 'enterprise', avgLTV: 415000, count: 5 },
    { segment: 'mid_market', avgLTV: 185000, count: 8 },
    { segment: 'small_business', avgLTV: 75000, count: 10 },
    { segment: 'startup', avgLTV: 95000, count: 4 },
    { segment: 'individual', avgLTV: 15000, count: 1 }
  ],
  ltvByIndustry: [
    { industry: 'Technology', avgLTV: 285000, count: 12 },
    { industry: 'Finance', avgLTV: 225000, count: 6 },
    { industry: 'Healthcare', avgLTV: 175000, count: 4 },
    { industry: 'E-commerce', avgLTV: 125000, count: 6 }
  ],
  ltvTrend: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toISOString().split('T')[0],
    avgLTV: 140000 + i * 3500
  })),
  ltvDistribution: [
    { range: '$0-50K', count: 8, percentage: 28.6 },
    { range: '$50-100K', count: 6, percentage: 21.4 },
    { range: '$100-200K', count: 7, percentage: 25 },
    { range: '$200-500K', count: 5, percentage: 17.9 },
    { range: '$500K+', count: 2, percentage: 7.1 }
  ]
}

const mockChurnAnalysis: ChurnAnalysis = {
  overallChurnRate: 7.1,
  churnBySegment: [
    { segment: 'enterprise', rate: 3.2 },
    { segment: 'mid_market', rate: 5.8 },
    { segment: 'small_business', rate: 8.5 },
    { segment: 'startup', rate: 15.2 },
    { segment: 'individual', rate: 22.0 }
  ],
  churnByReason: [
    { reason: 'Budget constraints', count: 12, percentage: 35 },
    { reason: 'Switched to competitor', count: 8, percentage: 24 },
    { reason: 'Project completed', count: 7, percentage: 21 },
    { reason: 'Poor fit', count: 4, percentage: 12 },
    { reason: 'Other', count: 3, percentage: 8 }
  ],
  churnPredictions: [
    { clientId: 'client-2', clientName: 'StartupXYZ', probability: 35, riskFactors: ['Budget constraints', 'Delayed payments', 'Reduced engagement'] },
    { clientId: 'client-5', clientName: 'LocalBiz', probability: 28, riskFactors: ['No recent projects', 'Competitor interest'] }
  ],
  retentionStrategies: [
    { id: 'rs-1', targetSegment: 'startup', triggerCondition: 'No activity for 30 days', action: 'Send check-in email with value add', estimatedImpact: 15, priority: 'high', automated: true },
    { id: 'rs-2', targetSegment: 'enterprise', triggerCondition: 'Contract renewal in 60 days', action: 'Schedule executive review', estimatedImpact: 25, priority: 'high', automated: false },
    { id: 'rs-3', targetSegment: 'small_business', triggerCondition: 'Health score below 60', action: 'Offer consultation call', estimatedImpact: 20, priority: 'medium', automated: true }
  ]
}

const mockInsights: ClientInsight[] = [
  { id: 'ci-1', clientId: 'client-1', type: 'opportunity', title: 'Expansion Opportunity', description: 'TechCorp expressed interest in mobile development. High conversion likelihood.', impact: 'high', actionItems: ['Prepare mobile proposal', 'Schedule discovery call'], dueDate: '2024-03-25' },
  { id: 'ci-2', clientId: 'client-2', type: 'risk', title: 'At-Risk Client', description: 'StartupXYZ showing signs of disengagement. Outstanding balance of $8,500.', impact: 'high', actionItems: ['Follow up on invoice', 'Schedule relationship call', 'Review project scope'], dueDate: '2024-03-22' },
  { id: 'ci-3', clientId: 'client-3', type: 'milestone', title: '2 Year Anniversary', description: 'Global Enterprises relationship milestone approaching. Great time for appreciation and upsell.', impact: 'medium', actionItems: ['Send anniversary note', 'Prepare loyalty offer'] }
]

// ============================================================================
// HOOK
// ============================================================================

// Empty defaults for when no data is available
const emptySummary: ClientValueSummary = {
  totalClients: 0, activeClients: 0, atRiskClients: 0, churningClients: 0,
  totalLTV: 0, averageLTV: 0, totalCAC: 0, averageCAC: 0,
  ltvToCacRatio: 0, averageMonthlyRevenue: 0, retentionRate: 0, churnRate: 0,
  netPromoterScore: 0, customerHealthScore: 0, expansionRevenue: 0, contractionRevenue: 0
}

const emptyLTVAnalysis: LTVAnalysis = {
  currentLTV: 0, projectedLTV: 0, ltvGrowth: 0, ltvBySegment: [],
  ltvByAcquisitionChannel: [], ltvDistribution: { high: 0, medium: 0, low: 0 }
}

interface UseClientValueOptions {}

export function useClientValue(options: UseClientValueOptions = {}) {
  const [clients, setClients] = useState<ClientValueMetrics[]>([])
  const [summary, setSummary] = useState<ClientValueSummary | null>(null)
  const [ltvAnalysis, setLtvAnalysis] = useState<LTVAnalysis | null>(null)
  const [churnAnalysis, setChurnAnalysis] = useState<ChurnAnalysis | null>(null)
  const [insights, setInsights] = useState<ClientInsight[]>([])
  const [cohorts, setCohorts] = useState<ClientCohort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchClientValue = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/business-intelligence?type=clients')
      const result = await response.json()

      if (response.ok && result.clients) {
        setClients(result.clients || [])
        setSummary({
          ...emptySummary,
          totalClients: result.summary?.totalClients || 0,
          activeClients: result.summary?.activeClients || 0,
          atRiskClients: result.summary?.atRiskClients || 0,
          averageLTV: result.summary?.averageLTV || 0,
          averageMonthlyRevenue: result.summary?.averageMonthlyRevenue || 0,
          ltvToCacRatio: result.summary?.ltvToCacRatio || 0,
          retentionRate: result.summary?.retentionRate || 0
        })
        setLtvAnalysis(emptyLTVAnalysis)
        setChurnAnalysis(null)
        setInsights(result.insights || [])
        setCohorts([])
      } else {
        setClients([])
        setSummary(emptySummary)
        setLtvAnalysis(emptyLTVAnalysis)
        setChurnAnalysis(null)
        setInsights([])
        setCohorts([])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch client value data'))
      setClients([])
      setSummary(emptySummary)
      setLtvAnalysis(emptyLTVAnalysis)
      setChurnAnalysis(null)
      setInsights([])
      setCohorts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // LTV Calculations
  const calculateLTV = useCallback((
    avgRevenuePerYear: number,
    avgRelationshipYears: number,
    grossMargin: number = 0.5
  ) => {
    return avgRevenuePerYear * avgRelationshipYears * grossMargin
  }, [])

  const calculateLTVtoCACRatio = useCallback((ltv: number, cac: number) => {
    if (cac === 0) return 0
    return ltv / cac
  }, [])

  const calculatePaybackPeriod = useCallback((cac: number, monthlyRevenue: number, grossMargin: number = 0.5) => {
    if (monthlyRevenue * grossMargin === 0) return 0
    return cac / (monthlyRevenue * grossMargin)
  }, [])

  // Health Score calculation
  const calculateHealthScore = useCallback((client: Partial<ClientValueMetrics>) => {
    let score = 0

    // Engagement (30%)
    score += (client.engagementScore || 0) * 0.3

    // Payment history (20%)
    score += (client.onTimePaymentRate || 0) * 0.2

    // Satisfaction (25%)
    score += (client.satisfactionScore || 0) * 0.25

    // Activity recency (15%)
    const daysSinceActivity = client.daysSinceLastActivity || 365
    const activityScore = Math.max(0, 100 - daysSinceActivity)
    score += activityScore * 0.15

    // Growth (10%)
    const growthScore = Math.min(100, Math.max(0, 50 + (client.revenueGrowthRate || 0)))
    score += growthScore * 0.1

    return Math.round(score)
  }, [])

  // Client segmentation
  const segmentClients = useCallback((criteria: Partial<CohortCriteria>) => {
    return clients.filter(client => {
      if (criteria.segment && !criteria.segment.includes(client.segment)) return false
      if (criteria.healthStatus && !criteria.healthStatus.includes(client.healthStatus)) return false
      if (criteria.revenueRange) {
        if (client.totalRevenue < criteria.revenueRange.min) return false
        if (client.totalRevenue > criteria.revenueRange.max) return false
      }
      return true
    })
  }, [clients])

  // Create cohort
  const createCohort = useCallback(async (name: string, description: string, criteria: CohortCriteria) => {
    const matchingClients = segmentClients(criteria)
    const cohort: ClientCohort = {
      id: `cohort-${Date.now()}`,
      name,
      description,
      criteria,
      clients: matchingClients.map(c => c.clientId),
      metrics: {
        clientCount: matchingClients.length,
        avgLTV: matchingClients.reduce((sum, c) => sum + c.lifetimeValue, 0) / matchingClients.length || 0,
        totalLTV: matchingClients.reduce((sum, c) => sum + c.lifetimeValue, 0),
        avgHealthScore: matchingClients.reduce((sum, c) => sum + c.healthScore, 0) / matchingClients.length || 0,
        avgChurnProbability: matchingClients.reduce((sum, c) => sum + c.churnProbability, 0) / matchingClients.length || 0,
        retentionRate: 100 - (matchingClients.reduce((sum, c) => sum + c.churnProbability, 0) / matchingClients.length || 0),
        avgRevenuePerClient: matchingClients.reduce((sum, c) => sum + c.totalRevenue, 0) / matchingClients.length || 0,
        totalRevenue: matchingClients.reduce((sum, c) => sum + c.totalRevenue, 0)
      }
    }
    setCohorts(prev => [...prev, cohort])
    return { success: true, cohort }
  }, [segmentClients])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchClientValue()
  }, [fetchClientValue])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const topValueClients = useMemo(() =>
    [...clients].sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 10),
    [clients]
  )

  const atRiskClients = useMemo(() =>
    clients.filter(c => c.healthStatus === 'at_risk' || c.healthStatus === 'churning'),
    [clients]
  )

  const highPotentialClients = useMemo(() =>
    clients.filter(c => c.upsellPotential >= 70 && c.healthStatus !== 'at_risk'),
    [clients]
  )

  const clientsBySegment = useMemo(() => {
    const grouped: Record<ClientSegment, ClientValueMetrics[]> = {
      enterprise: [], mid_market: [], small_business: [], startup: [], individual: []
    }
    clients.forEach(c => grouped[c.segment].push(c))
    return grouped
  }, [clients])

  const urgentInsights = useMemo(() =>
    insights.filter(i => i.impact === 'high' || i.type === 'risk'),
    [insights]
  )

  // Format helpers
  const formatCurrency = useCallback((value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value),
    []
  )

  const formatPercentage = useCallback((value: number) =>
    `${value.toFixed(1)}%`,
    []
  )

  return {
    // Data
    clients,
    summary,
    ltvAnalysis,
    churnAnalysis,
    insights,
    cohorts,

    // Computed
    topValueClients,
    atRiskClients,
    highPotentialClients,
    clientsBySegment,
    urgentInsights,

    // State
    isLoading,
    error,

    // Actions
    refresh,
    createCohort,
    segmentClients,

    // Calculations
    calculateLTV,
    calculateLTVtoCACRatio,
    calculatePaybackPeriod,
    calculateHealthScore,

    // Formatters
    formatCurrency,
    formatPercentage
  }
}

export default useClientValue
