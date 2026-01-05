'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES - Comprehensive Business Intelligence for All User Types
// Supports: Freelancers, Entrepreneurs, Agencies, Enterprises
// ============================================================================

export type BusinessType = 'freelancer' | 'entrepreneur' | 'agency' | 'enterprise'
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type TrendDirection = 'up' | 'down' | 'stable'
export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical'

export interface BusinessMetrics {
  // Revenue Metrics
  totalRevenue: number
  recurringRevenue: number // MRR for subscriptions
  projectRevenue: number
  revenueGrowth: number // percentage
  revenueBySource: RevenueSource[]
  revenueByClient: ClientRevenue[]
  revenueTrend: TrendData[]

  // Profitability Metrics
  grossProfit: number
  grossMargin: number // percentage
  netProfit: number
  netMargin: number // percentage
  operatingExpenses: number
  costOfGoodsSold: number
  profitByProject: ProjectProfit[]
  profitByClient: ClientProfit[]

  // Client Metrics
  totalClients: number
  activeClients: number
  newClients: number
  churnedClients: number
  churnRate: number // percentage
  clientAcquisitionCost: number // CAC
  clientLifetimeValue: number // LTV
  ltvToCacRatio: number
  clientRetentionRate: number

  // Project Metrics
  totalProjects: number
  activeProjects: number
  completedProjects: number
  projectSuccessRate: number
  averageProjectValue: number
  averageProjectDuration: number // days
  projectsOnTime: number // percentage
  projectsOnBudget: number // percentage

  // Time & Utilization
  billableHours: number
  nonBillableHours: number
  utilizationRate: number // percentage
  effectiveHourlyRate: number
  targetUtilization: number

  // Cash Flow
  cashOnHand: number
  accountsReceivable: number
  accountsPayable: number
  cashRunway: number // months
  burnRate: number // monthly

  // Growth Metrics
  monthOverMonthGrowth: number
  yearOverYearGrowth: number
  leadVelocityRate: number
  conversionRate: number
  pipelineValue: number
}

export interface RevenueSource {
  id: string
  name: string
  type: 'service' | 'product' | 'subscription' | 'consulting' | 'retainer' | 'other'
  amount: number
  percentage: number
  trend: TrendDirection
  trendValue: number
}

export interface ClientRevenue {
  clientId: string
  clientName: string
  revenue: number
  percentage: number
  projectCount: number
  avgProjectValue: number
  lastInvoiceDate: string
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface ClientProfit {
  clientId: string
  clientName: string
  revenue: number
  costs: number
  profit: number
  margin: number
  hoursSpent: number
  effectiveRate: number
  profitability: HealthStatus
}

export interface ProjectProfit {
  projectId: string
  projectName: string
  clientName: string
  budget: number
  actualCost: number
  revenue: number
  profit: number
  margin: number
  hoursEstimated: number
  hoursActual: number
  status: 'profitable' | 'break_even' | 'loss'
}

export interface TrendData {
  date: string
  value: number
  projected?: number
}

export interface BusinessGoal {
  id: string
  name: string
  type: 'revenue' | 'profit' | 'clients' | 'projects' | 'utilization' | 'growth' | 'custom'
  targetValue: number
  currentValue: number
  progress: number // percentage
  startDate: string
  endDate: string
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved'
  milestones: GoalMilestone[]
}

export interface GoalMilestone {
  id: string
  name: string
  targetValue: number
  targetDate: string
  achieved: boolean
  achievedDate?: string
}

export interface BusinessHealthScore {
  overall: number // 0-100
  status: HealthStatus
  components: HealthComponent[]
  recommendations: Recommendation[]
  alerts: BusinessAlert[]
}

export interface HealthComponent {
  name: string
  score: number
  weight: number
  status: HealthStatus
  description: string
  factors: string[]
}

export interface Recommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: 'revenue' | 'costs' | 'clients' | 'operations' | 'growth'
  title: string
  description: string
  potentialImpact: string
  actionItems: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
}

export interface BusinessAlert {
  id: string
  type: 'warning' | 'critical' | 'info' | 'success'
  category: string
  title: string
  message: string
  metric?: string
  threshold?: number
  currentValue?: number
  createdAt: string
  isRead: boolean
  actionUrl?: string
}

export interface Forecast {
  period: string
  revenue: ForecastValue
  expenses: ForecastValue
  profit: ForecastValue
  clients: ForecastValue
  projects: ForecastValue
}

export interface ForecastValue {
  predicted: number
  lowerBound: number
  upperBound: number
  confidence: number
  trend: TrendDirection
}

export interface BenchmarkData {
  metric: string
  yourValue: number
  industryAverage: number
  topPerformers: number
  percentile: number
  status: 'above' | 'average' | 'below'
}

// ============================================================================
// DEFAULT EMPTY DATA - Used when no data is available from API
// ============================================================================

const emptyMetrics: BusinessMetrics = {
  totalRevenue: 0, recurringRevenue: 0, projectRevenue: 0, revenueGrowth: 0,
  revenueBySource: [], revenueByClient: [], revenueTrend: [],
  grossProfit: 0, grossMargin: 0, netProfit: 0, netMargin: 0,
  operatingExpenses: 0, costOfGoodsSold: 0, profitByProject: [], profitByClient: [],
  totalClients: 0, activeClients: 0, newClients: 0, churnedClients: 0,
  churnRate: 0, clientAcquisitionCost: 0, clientLifetimeValue: 0,
  ltvToCacRatio: 0, clientRetentionRate: 0,
  totalProjects: 0, activeProjects: 0, completedProjects: 0,
  projectSuccessRate: 0, averageProjectValue: 0, averageProjectDuration: 0,
  projectsOnTime: 0, projectsOnBudget: 0,
  billableHours: 0, nonBillableHours: 0, utilizationRate: 0,
  effectiveHourlyRate: 0, targetUtilization: 80,
  cashOnHand: 0, accountsReceivable: 0, accountsPayable: 0,
  cashRunway: 0, burnRate: 0,
  monthOverMonthGrowth: 0, yearOverYearGrowth: 0, leadVelocityRate: 0,
  conversionRate: 0, pipelineValue: 0
}

const emptyHealthScore: BusinessHealthScore = {
  overall: 0, status: 'warning',
  components: [], recommendations: [], alerts: []
}

// ============================================================================
// HOOK
// ============================================================================

interface UseBusinessIntelligenceOptions {
  businessType?: BusinessType
  timeFrame?: TimeFrame
  startDate?: string
  endDate?: string
}

export function useBusinessIntelligence(options: UseBusinessIntelligenceOptions = {}) {
  const {
    businessType = 'freelancer',
    timeFrame = 'monthly'
  } = options

  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [goals, setGoals] = useState<BusinessGoal[]>([])
  const [healthScore, setHealthScore] = useState<BusinessHealthScore | null>(null)
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBusinessData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/business-intelligence?type=${businessType}&timeFrame=${timeFrame}`)
      const result = await response.json()

      if (response.ok) {
        // Map API response to our data structure
        setMetrics(result.metrics || {
          ...emptyMetrics,
          totalRevenue: result.revenue?.total || 0,
          recurringRevenue: result.revenue?.recurring || 0,
          projectRevenue: result.revenue?.projectBased || 0,
          revenueGrowth: result.revenue?.growth || 0,
          grossProfit: result.profitability?.grossProfit || 0,
          grossMargin: result.profitability?.grossMargin || 0,
          netProfit: result.profitability?.netProfit || 0,
          netMargin: result.profitability?.netMargin || 0,
          totalClients: result.clients?.total || 0,
          activeClients: result.clients?.active || 0,
          newClients: result.clients?.newThisPeriod || 0,
          totalProjects: result.projects?.total || 0,
          activeProjects: result.projects?.active || 0,
          completedProjects: result.projects?.completed || 0,
          utilizationRate: result.efficiency?.utilizationRate || 0,
          billableHours: result.efficiency?.billableHours || 0,
          effectiveHourlyRate: result.efficiency?.effectiveRate || 0
        })
        setGoals(result.goals || [])
        setHealthScore(result.healthScore || emptyHealthScore)
        setForecasts(result.forecasts || [])
        setBenchmarks(result.benchmarks || [])
      } else {
        setError(new Error(result.error || 'Failed to fetch data'))
        setMetrics(emptyMetrics)
        setGoals([])
        setHealthScore(emptyHealthScore)
        setForecasts([])
        setBenchmarks([])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch business intelligence data'))
      setMetrics(emptyMetrics)
      setGoals([])
      setHealthScore(emptyHealthScore)
      setForecasts([])
      setBenchmarks([])
    } finally {
      setIsLoading(false)
    }
  }, [businessType, timeFrame])

  // Goal Management
  const createGoal = useCallback(async (goal: Omit<BusinessGoal, 'id' | 'progress' | 'status'>) => {
    const newGoal: BusinessGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      progress: (goal.currentValue / goal.targetValue) * 100,
      status: goal.currentValue >= goal.targetValue ? 'achieved' :
              goal.currentValue >= goal.targetValue * 0.7 ? 'on_track' :
              goal.currentValue >= goal.targetValue * 0.5 ? 'at_risk' : 'behind'
    }
    setGoals(prev => [...prev, newGoal])
    return { success: true, goal: newGoal }
  }, [])

  const updateGoal = useCallback(async (goalId: string, updates: Partial<BusinessGoal>) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g))
    return { success: true }
  }, [])

  const deleteGoal = useCallback(async (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
    return { success: true }
  }, [])

  // Alert Management
  const markAlertAsRead = useCallback(async (alertId: string) => {
    if (healthScore) {
      setHealthScore({
        ...healthScore,
        alerts: healthScore.alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a)
      })
    }
    return { success: true }
  }, [healthScore])

  const dismissAlert = useCallback(async (alertId: string) => {
    if (healthScore) {
      setHealthScore({
        ...healthScore,
        alerts: healthScore.alerts.filter(a => a.id !== alertId)
      })
    }
    return { success: true }
  }, [healthScore])

  // Calculations
  const calculateProjectProfit = useCallback((budget: number, actualCost: number, revenue: number) => {
    const profit = revenue - actualCost
    const margin = (profit / revenue) * 100
    return { profit, margin, status: margin > 20 ? 'profitable' : margin > 0 ? 'break_even' : 'loss' }
  }, [])

  const calculateClientLTV = useCallback((avgProjectValue: number, projectsPerYear: number, avgRelationshipYears: number) => {
    return avgProjectValue * projectsPerYear * avgRelationshipYears
  }, [])

  const calculateBreakeven = useCallback((fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number) => {
    if (pricePerUnit <= variableCostPerUnit) return Infinity
    return fixedCosts / (pricePerUnit - variableCostPerUnit)
  }, [])

  const calculateRunway = useCallback((cashOnHand: number, monthlyBurnRate: number) => {
    if (monthlyBurnRate <= 0) return Infinity
    return cashOnHand / monthlyBurnRate
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchBusinessData()
  }, [fetchBusinessData])

  useEffect(() => { refresh() }, [refresh])

  // Computed Values
  const unreadAlerts = useMemo(() =>
    healthScore?.alerts.filter(a => !a.isRead) || [],
    [healthScore]
  )

  const criticalAlerts = useMemo(() =>
    healthScore?.alerts.filter(a => a.type === 'critical') || [],
    [healthScore]
  )

  const goalsAtRisk = useMemo(() =>
    goals.filter(g => g.status === 'at_risk' || g.status === 'behind'),
    [goals]
  )

  const topClients = useMemo(() =>
    metrics?.revenueByClient.slice(0, 5) || [],
    [metrics]
  )

  const profitableProjects = useMemo(() =>
    metrics?.profitByProject.filter(p => p.status === 'profitable') || [],
    [metrics]
  )

  const underperformingProjects = useMemo(() =>
    metrics?.profitByProject.filter(p => p.status !== 'profitable') || [],
    [metrics]
  )

  const highPriorityRecommendations = useMemo(() =>
    healthScore?.recommendations.filter(r => r.priority === 'high') || [],
    [healthScore]
  )

  const revenueProjection = useMemo(() => {
    if (!forecasts.length) return null
    const nextMonth = forecasts[0]
    return {
      predicted: nextMonth.revenue.predicted,
      range: `${nextMonth.revenue.lowerBound.toLocaleString()} - ${nextMonth.revenue.upperBound.toLocaleString()}`,
      confidence: nextMonth.revenue.confidence
    }
  }, [forecasts])

  // Format helpers
  const formatCurrency = useCallback((value: number | undefined | null, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value ?? 0)
  }, [])

  const formatPercentage = useCallback((value: number | undefined | null, decimals = 1) => {
    return `${(value ?? 0).toFixed(decimals)}%`
  }, [])

  const formatTrend = useCallback((value: number | undefined | null) => {
    const val = value ?? 0
    const prefix = val >= 0 ? '+' : ''
    return `${prefix}${val.toFixed(1)}%`
  }, [])

  return {
    // Data
    metrics,
    goals,
    healthScore,
    forecasts,
    benchmarks,

    // Computed
    unreadAlerts,
    criticalAlerts,
    goalsAtRisk,
    topClients,
    profitableProjects,
    underperformingProjects,
    highPriorityRecommendations,
    revenueProjection,

    // State
    isLoading,
    error,

    // Actions
    refresh,
    createGoal,
    updateGoal,
    deleteGoal,
    markAlertAsRead,
    dismissAlert,

    // Calculations
    calculateProjectProfit,
    calculateClientLTV,
    calculateBreakeven,
    calculateRunway,

    // Formatters
    formatCurrency,
    formatPercentage,
    formatTrend
  }
}

export default useBusinessIntelligence
