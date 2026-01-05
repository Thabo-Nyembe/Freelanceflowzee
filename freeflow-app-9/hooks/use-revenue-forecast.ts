'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES - Revenue Forecasting & Financial Planning
// For Freelancers, Agencies, and Enterprises
// ============================================================================

export type ForecastPeriod = 'monthly' | 'quarterly' | 'yearly'
export type ForecastMethod = 'linear' | 'exponential' | 'seasonal' | 'ml_based'
export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic'

export interface RevenueForecast {
  period: string
  label: string
  actual?: number
  predicted: number
  lowerBound: number
  upperBound: number
  confidence: number
  breakdown: ForecastBreakdown
  assumptions: string[]
}

export interface ForecastBreakdown {
  projectRevenue: number
  recurringRevenue: number
  consultingRevenue: number
  productRevenue: number
  otherRevenue: number
}

export interface ForecastScenario {
  id: string
  name: string
  type: ScenarioType
  description: string
  assumptions: ScenarioAssumption[]
  forecasts: RevenueForecast[]
  summary: ScenarioSummary
}

export interface ScenarioAssumption {
  category: string
  assumption: string
  impact: number
  probability: number
}

export interface ScenarioSummary {
  totalRevenue: number
  avgMonthlyRevenue: number
  growthRate: number
  peakMonth: string
  peakRevenue: number
  probability: number
}

export interface PipelineRevenue {
  stage: string
  count: number
  value: number
  avgDealSize: number
  probability: number
  weightedValue: number
  expectedCloseDate: string
}

export interface RevenueGoal {
  id: string
  name: string
  type: 'monthly' | 'quarterly' | 'yearly'
  targetAmount: number
  currentAmount: number
  progress: number
  status: 'on_track' | 'at_risk' | 'behind' | 'exceeded'
  startDate: string
  endDate: string
  milestones: GoalMilestone[]
}

export interface GoalMilestone {
  id: string
  date: string
  targetAmount: number
  actualAmount?: number
  achieved: boolean
}

export interface CashFlowForecast {
  period: string
  inflows: CashInflow[]
  outflows: CashOutflow[]
  netCashFlow: number
  openingBalance: number
  closingBalance: number
  runway: number
}

export interface CashInflow {
  source: string
  amount: number
  probability: number
  expectedDate: string
}

export interface CashOutflow {
  category: string
  amount: number
  isFixed: boolean
  isEssential: boolean
}

export interface SeasonalityPattern {
  month: number
  monthName: string
  index: number // 1.0 = average, >1 = above average, <1 = below average
  historicalRevenue: number
  factors: string[]
}

export interface RevenueDriver {
  id: string
  name: string
  category: 'client' | 'service' | 'market' | 'operational'
  currentValue: number
  projectedValue: number
  impact: number // percentage impact on revenue
  trend: 'increasing' | 'stable' | 'decreasing'
  controllable: boolean
  actions: string[]
}

export interface ForecastSummary {
  currentMonthForecast: number
  currentQuarterForecast: number
  currentYearForecast: number
  nextMonthForecast: number
  nextQuarterForecast: number
  confidenceLevel: number
  accuracy: number // based on past forecasts
  lastUpdated: string
  keyDrivers: string[]
  risks: string[]
  opportunities: string[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockForecasts: RevenueForecast[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2024, i, 1)
  const baseRevenue = 28000 + i * 2500
  const seasonalFactor = 1 + Math.sin((i - 2) * Math.PI / 6) * 0.15
  const predicted = Math.round(baseRevenue * seasonalFactor)

  return {
    period: date.toISOString().split('T')[0],
    label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    actual: i < 3 ? predicted + Math.round((Math.random() - 0.5) * 5000) : undefined,
    predicted,
    lowerBound: Math.round(predicted * 0.85),
    upperBound: Math.round(predicted * 1.15),
    confidence: Math.max(50, 95 - i * 5),
    breakdown: {
      projectRevenue: Math.round(predicted * 0.65),
      recurringRevenue: Math.round(predicted * 0.20),
      consultingRevenue: Math.round(predicted * 0.10),
      productRevenue: Math.round(predicted * 0.03),
      otherRevenue: Math.round(predicted * 0.02)
    },
    assumptions: ['Historical growth rate continues', 'No major client churn', 'Market conditions stable']
  }
})

const mockScenarios: ForecastScenario[] = [
  {
    id: 'scenario-1',
    name: 'Optimistic Growth',
    type: 'optimistic',
    description: 'Best case scenario with strong growth and new client acquisition',
    assumptions: [
      { category: 'Clients', assumption: '5 new enterprise clients', impact: 25, probability: 40 },
      { category: 'Pricing', assumption: '15% rate increase successful', impact: 15, probability: 60 },
      { category: 'Market', assumption: 'Strong market demand', impact: 10, probability: 50 }
    ],
    forecasts: mockForecasts.map(f => ({ ...f, predicted: Math.round(f.predicted * 1.3) })),
    summary: { totalRevenue: 520000, avgMonthlyRevenue: 43333, growthRate: 45, peakMonth: 'December', peakRevenue: 58000, probability: 25 }
  },
  {
    id: 'scenario-2',
    name: 'Realistic Projection',
    type: 'realistic',
    description: 'Most likely scenario based on current trends',
    assumptions: [
      { category: 'Clients', assumption: '2 new clients, 1 churn', impact: 5, probability: 70 },
      { category: 'Pricing', assumption: '5% rate increase', impact: 5, probability: 80 },
      { category: 'Market', assumption: 'Stable market conditions', impact: 0, probability: 75 }
    ],
    forecasts: mockForecasts,
    summary: { totalRevenue: 400000, avgMonthlyRevenue: 33333, growthRate: 25, peakMonth: 'November', peakRevenue: 45000, probability: 60 }
  },
  {
    id: 'scenario-3',
    name: 'Conservative Estimate',
    type: 'pessimistic',
    description: 'Worst case scenario with potential challenges',
    assumptions: [
      { category: 'Clients', assumption: '2 major clients churn', impact: -20, probability: 20 },
      { category: 'Pricing', assumption: 'No rate changes', impact: 0, probability: 90 },
      { category: 'Market', assumption: 'Economic slowdown', impact: -15, probability: 30 }
    ],
    forecasts: mockForecasts.map(f => ({ ...f, predicted: Math.round(f.predicted * 0.75) })),
    summary: { totalRevenue: 300000, avgMonthlyRevenue: 25000, growthRate: 5, peakMonth: 'October', peakRevenue: 32000, probability: 15 }
  }
]

const mockPipeline: PipelineRevenue[] = [
  { stage: 'Qualified Lead', count: 12, value: 180000, avgDealSize: 15000, probability: 20, weightedValue: 36000, expectedCloseDate: '2024-06-30' },
  { stage: 'Discovery', count: 8, value: 145000, avgDealSize: 18125, probability: 40, weightedValue: 58000, expectedCloseDate: '2024-05-31' },
  { stage: 'Proposal Sent', count: 5, value: 95000, avgDealSize: 19000, probability: 60, weightedValue: 57000, expectedCloseDate: '2024-04-30' },
  { stage: 'Negotiation', count: 3, value: 68000, avgDealSize: 22666, probability: 80, weightedValue: 54400, expectedCloseDate: '2024-04-15' },
  { stage: 'Contract Sent', count: 2, value: 45000, avgDealSize: 22500, probability: 90, weightedValue: 40500, expectedCloseDate: '2024-03-31' }
]

const mockGoals: RevenueGoal[] = [
  {
    id: 'goal-1',
    name: 'Q1 2024 Revenue',
    type: 'quarterly',
    targetAmount: 100000,
    currentAmount: 87500,
    progress: 87.5,
    status: 'on_track',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    milestones: [
      { id: 'm-1', date: '2024-01-31', targetAmount: 30000, actualAmount: 32500, achieved: true },
      { id: 'm-2', date: '2024-02-29', targetAmount: 65000, actualAmount: 61000, achieved: false },
      { id: 'm-3', date: '2024-03-31', targetAmount: 100000, achieved: false }
    ]
  },
  {
    id: 'goal-2',
    name: 'Annual Revenue 2024',
    type: 'yearly',
    targetAmount: 400000,
    currentAmount: 87500,
    progress: 21.9,
    status: 'on_track',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    milestones: []
  }
]

const mockSeasonality: SeasonalityPattern[] = [
  { month: 1, monthName: 'January', index: 0.85, historicalRevenue: 24000, factors: ['Post-holiday slowdown', 'Budget planning'] },
  { month: 2, monthName: 'February', index: 0.90, historicalRevenue: 25500, factors: ['Q1 projects starting'] },
  { month: 3, monthName: 'March', index: 1.05, historicalRevenue: 29500, factors: ['Q1 rush', 'Year-end fiscal close'] },
  { month: 4, monthName: 'April', index: 1.10, historicalRevenue: 31000, factors: ['New budget releases'] },
  { month: 5, monthName: 'May', index: 1.05, historicalRevenue: 29500, factors: ['Steady demand'] },
  { month: 6, monthName: 'June', index: 0.95, historicalRevenue: 26800, factors: ['Q2 close', 'Summer slowdown begins'] },
  { month: 7, monthName: 'July', index: 0.80, historicalRevenue: 22500, factors: ['Summer vacation season'] },
  { month: 8, monthName: 'August', index: 0.85, historicalRevenue: 24000, factors: ['Summer slowdown'] },
  { month: 9, monthName: 'September', index: 1.15, historicalRevenue: 32500, factors: ['Back to business', 'Q3 push'] },
  { month: 10, monthName: 'October', index: 1.20, historicalRevenue: 33800, factors: ['Q4 budget spending', 'Year-end projects'] },
  { month: 11, monthName: 'November', index: 1.15, historicalRevenue: 32500, factors: ['Year-end rush'] },
  { month: 12, monthName: 'December', index: 0.95, historicalRevenue: 26800, factors: ['Holiday slowdown', 'Project completions'] }
]

const mockDrivers: RevenueDriver[] = [
  { id: 'driver-1', name: 'Client Acquisition Rate', category: 'client', currentValue: 2, projectedValue: 3, impact: 15, trend: 'increasing', controllable: true, actions: ['Increase marketing spend', 'Expand referral program'] },
  { id: 'driver-2', name: 'Average Deal Size', category: 'client', currentValue: 22000, projectedValue: 25000, impact: 12, trend: 'increasing', controllable: true, actions: ['Upsell premium services', 'Bundle offerings'] },
  { id: 'driver-3', name: 'Client Retention Rate', category: 'client', currentValue: 93, projectedValue: 95, impact: 20, trend: 'stable', controllable: true, actions: ['Improve onboarding', 'Regular check-ins'] },
  { id: 'driver-4', name: 'Utilization Rate', category: 'operational', currentValue: 82, projectedValue: 85, impact: 8, trend: 'increasing', controllable: true, actions: ['Optimize scheduling', 'Reduce admin time'] },
  { id: 'driver-5', name: 'Market Demand', category: 'market', currentValue: 75, projectedValue: 80, impact: 25, trend: 'increasing', controllable: false, actions: ['Monitor industry trends', 'Diversify services'] }
]

const mockSummary: ForecastSummary = {
  currentMonthForecast: 32500,
  currentQuarterForecast: 98000,
  currentYearForecast: 400000,
  nextMonthForecast: 35000,
  nextQuarterForecast: 108000,
  confidenceLevel: 78,
  accuracy: 92,
  lastUpdated: new Date().toISOString(),
  keyDrivers: ['Strong pipeline', 'Recurring revenue growth', 'High retention'],
  risks: ['Economic uncertainty', 'Key client dependency', 'Seasonal dip in Q3'],
  opportunities: ['Enterprise market expansion', 'New service line', 'Rate increase potential']
}

// ============================================================================
// HOOK
// ============================================================================

interface UseRevenueForecastOptions {
  period?: ForecastPeriod
  method?: ForecastMethod
}

export function useRevenueForecast(options: UseRevenueForecastOptions = {}) {
  const { period = 'monthly', method = 'linear' } = options

  const [forecasts, setForecasts] = useState<RevenueForecast[]>([])
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([])
  const [pipeline, setPipeline] = useState<PipelineRevenue[]>([])
  const [goals, setGoals] = useState<RevenueGoal[]>([])
  const [seasonality, setSeasonality] = useState<SeasonalityPattern[]>([])
  const [drivers, setDrivers] = useState<RevenueDriver[]>([])
  const [summary, setSummary] = useState<ForecastSummary | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario-2')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchForecast = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/business-intelligence?type=forecast&period=${period}&method=${method}`)
      const result = await response.json()

      if (response.ok) {
        setForecasts(result.forecasts || [])
        setScenarios(result.scenarios || [])
        setPipeline([])
        setGoals([])
        setSeasonality([])
        setDrivers([])
        setSummary({
          totalProjected: result.forecasts?.reduce((sum: number, f: any) => sum + (f.projected || 0), 0) || 0,
          projectedGrowth: result.historical?.growthRate || 0,
          averageMonthly: result.historical?.averageRevenue || 0,
          pipelineValue: result.pipeline?.total || 0,
          confidence: 70,
          riskFactors: [],
          opportunities: []
        })
      } else {
        setForecasts([])
        setScenarios([])
        setPipeline([])
        setGoals([])
        setSeasonality([])
        setDrivers([])
        setSummary(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch forecast data'))
      setForecasts([])
      setScenarios([])
      setPipeline([])
      setGoals([])
      setSeasonality([])
      setDrivers([])
      setSummary(null)
    } finally {
      setIsLoading(false)
    }
  }, [period, method])

  // Goal Management
  const createGoal = useCallback(async (goal: Omit<RevenueGoal, 'id' | 'progress' | 'status'>) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const newGoal: RevenueGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      progress,
      status: progress >= 100 ? 'exceeded' :
              progress >= 70 ? 'on_track' :
              progress >= 50 ? 'at_risk' : 'behind'
    }
    setGoals(prev => [...prev, newGoal])
    return { success: true, goal: newGoal }
  }, [])

  const updateGoalProgress = useCallback(async (goalId: string, currentAmount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g
      const progress = (currentAmount / g.targetAmount) * 100
      return {
        ...g,
        currentAmount,
        progress,
        status: progress >= 100 ? 'exceeded' :
                progress >= 70 ? 'on_track' :
                progress >= 50 ? 'at_risk' : 'behind'
      }
    }))
    return { success: true }
  }, [])

  // Scenario Analysis
  const runScenario = useCallback((assumptions: ScenarioAssumption[]) => {
    const totalImpact = assumptions.reduce((sum, a) => sum + (a.impact * a.probability / 100), 0)
    const adjustedForecasts = forecasts.map(f => ({
      ...f,
      predicted: Math.round(f.predicted * (1 + totalImpact / 100))
    }))
    return adjustedForecasts
  }, [forecasts])

  // Pipeline Weighted Revenue
  const calculateWeightedPipeline = useCallback(() => {
    return pipeline.reduce((sum, p) => sum + p.weightedValue, 0)
  }, [pipeline])

  // Seasonality Adjustment
  const adjustForSeasonality = useCallback((baseValue: number, month: number) => {
    const pattern = seasonality.find(s => s.month === month)
    return pattern ? baseValue * pattern.index : baseValue
  }, [seasonality])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchForecast()
  }, [fetchForecast])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const currentScenario = useMemo(() =>
    scenarios.find(s => s.id === selectedScenario),
    [scenarios, selectedScenario]
  )

  const totalPipelineValue = useMemo(() =>
    pipeline.reduce((sum, p) => sum + p.value, 0),
    [pipeline]
  )

  const weightedPipelineValue = useMemo(() =>
    pipeline.reduce((sum, p) => sum + p.weightedValue, 0),
    [pipeline]
  )

  const goalsAtRisk = useMemo(() =>
    goals.filter(g => g.status === 'at_risk' || g.status === 'behind'),
    [goals]
  )

  const highImpactDrivers = useMemo(() =>
    drivers.filter(d => d.impact >= 15 && d.controllable),
    [drivers]
  )

  const peakMonth = useMemo(() =>
    seasonality.reduce((max, s) => s.index > max.index ? s : max, seasonality[0]),
    [seasonality]
  )

  const slowMonth = useMemo(() =>
    seasonality.reduce((min, s) => s.index < min.index ? s : min, seasonality[0]),
    [seasonality]
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
    forecasts,
    scenarios,
    pipeline,
    goals,
    seasonality,
    drivers,
    summary,

    // Selection
    selectedScenario,
    setSelectedScenario,
    currentScenario,

    // Computed
    totalPipelineValue,
    weightedPipelineValue,
    goalsAtRisk,
    highImpactDrivers,
    peakMonth,
    slowMonth,

    // State
    isLoading,
    error,

    // Actions
    refresh,
    createGoal,
    updateGoalProgress,
    runScenario,
    calculateWeightedPipeline,
    adjustForSeasonality,

    // Formatters
    formatCurrency,
    formatPercentage
  }
}

export default useRevenueForecast
