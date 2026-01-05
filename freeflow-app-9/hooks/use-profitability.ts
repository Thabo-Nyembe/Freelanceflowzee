'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES - Profitability Analysis for Freelancers, Agencies & Enterprises
// ============================================================================

export type ProfitabilityLevel = 'highly_profitable' | 'profitable' | 'marginal' | 'break_even' | 'loss_making'

export interface ProfitabilityDashboard {
  overview: ProfitOverview
  projectProfitability: ProjectProfitability[]
  clientProfitability: ClientProfitability[]
  serviceProfitability: ServiceProfitability[]
  timeProfitability: TimeProfitability
  trends: ProfitTrend[]
  insights: ProfitInsight[]
}

export interface ProfitOverview {
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
  operatingExpenses: number
  overheadCosts: number
  directCosts: number
  profitPerHour: number
  profitPerProject: number
  profitPerClient: number
  targetMargin: number
  marginVariance: number
  revenueAtRisk: number
}

export interface ProjectProfitability {
  id: string
  name: string
  clientId: string
  clientName: string
  status: 'active' | 'completed' | 'on_hold'

  // Financial
  quotedAmount: number
  actualRevenue: number
  estimatedCosts: number
  actualCosts: number
  grossProfit: number
  grossMargin: number

  // Time
  estimatedHours: number
  actualHours: number
  billableHours: number
  nonBillableHours: number
  hoursVariance: number

  // Rates
  quotedRate: number
  effectiveRate: number
  costPerHour: number

  // Costs breakdown
  laborCosts: number
  materialCosts: number
  toolsCosts: number
  overheadAllocation: number

  // Status
  profitabilityLevel: ProfitabilityLevel
  isOverBudget: boolean
  isOverTime: boolean
  riskFactors: string[]

  // Timeline
  startDate: string
  endDate?: string
  daysActive: number
}

export interface ClientProfitability {
  id: string
  name: string
  company?: string

  // Revenue
  totalRevenue: number
  revenueThisYear: number
  revenueLastYear: number
  revenueGrowth: number
  avgProjectValue: number

  // Profitability
  totalCosts: number
  totalProfit: number
  profitMargin: number
  effectiveRate: number

  // Engagement
  projectCount: number
  activeProjects: number
  completedProjects: number
  totalHours: number
  avgHoursPerProject: number

  // Quality metrics
  onTimeDelivery: number
  scopeCreep: number
  revisionRate: number
  paymentSpeed: number // avg days to pay

  // Relationship
  clientSince: string
  lastProjectDate: string
  communicationScore: number
  satisfactionScore: number

  // Classification
  profitabilityLevel: ProfitabilityLevel
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  riskLevel: 'low' | 'medium' | 'high'
  churnRisk: number

  // Recommendations
  upsellPotential: number
  recommendedActions: string[]
}

export interface ServiceProfitability {
  id: string
  name: string
  category: string

  // Volume
  projectCount: number
  totalHours: number
  avgProjectHours: number

  // Revenue
  totalRevenue: number
  avgProjectRevenue: number
  avgHourlyRate: number

  // Costs
  totalCosts: number
  avgProjectCosts: number
  avgCostPerHour: number

  // Profitability
  totalProfit: number
  avgProjectProfit: number
  profitMargin: number
  profitPerHour: number

  // Trends
  demandTrend: 'increasing' | 'stable' | 'decreasing'
  marginTrend: 'improving' | 'stable' | 'declining'

  // Recommendations
  pricingRecommendation: 'increase' | 'maintain' | 'decrease'
  recommendedRate: number
  notes: string
}

export interface TimeProfitability {
  daily: ProfitPeriod[]
  weekly: ProfitPeriod[]
  monthly: ProfitPeriod[]
  quarterly: ProfitPeriod[]
  yearly: ProfitPeriod[]
}

export interface ProfitPeriod {
  period: string
  label: string
  revenue: number
  costs: number
  profit: number
  margin: number
  hours: number
  profitPerHour: number
  projectsCompleted: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface ProfitTrend {
  date: string
  revenue: number
  costs: number
  profit: number
  margin: number
  movingAverage?: number
  forecast?: number
}

export interface ProfitInsight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'info'
  category: 'pricing' | 'efficiency' | 'client' | 'service' | 'costs'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  metric?: string
  value?: number
  target?: number
  actions: string[]
}

export interface CostBreakdown {
  category: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  budgeted: number
  variance: number
}

export interface PricingAnalysis {
  currentRate: number
  marketRate: number
  optimalRate: number
  rateByExperience: { level: string; rate: number }[]
  rateByIndustry: { industry: string; rate: number }[]
  priceElasticity: number
  recommendedIncrease: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockOverview: ProfitOverview = {
  totalRevenue: 287500,
  totalCosts: 143750,
  grossProfit: 201250,
  grossMargin: 70,
  netProfit: 143750,
  netMargin: 50,
  operatingExpenses: 57500,
  overheadCosts: 28750,
  directCosts: 115000,
  profitPerHour: 87.12,
  profitPerProject: 3194.44,
  profitPerClient: 5133.93,
  targetMargin: 55,
  marginVariance: -5,
  revenueAtRisk: 35000
}

const mockProjectProfitability: ProjectProfitability[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform Rebuild',
    clientId: 'client-1',
    clientName: 'TechCorp Inc',
    status: 'active',
    quotedAmount: 45000,
    actualRevenue: 42000,
    estimatedCosts: 27000,
    actualCosts: 25200,
    grossProfit: 16800,
    grossMargin: 40,
    estimatedHours: 300,
    actualHours: 280,
    billableHours: 260,
    nonBillableHours: 20,
    hoursVariance: -20,
    quotedRate: 150,
    effectiveRate: 161.54,
    costPerHour: 90,
    laborCosts: 21000,
    materialCosts: 2200,
    toolsCosts: 1000,
    overheadAllocation: 1000,
    profitabilityLevel: 'profitable',
    isOverBudget: false,
    isOverTime: false,
    riskFactors: [],
    startDate: '2024-01-15',
    daysActive: 65
  },
  {
    id: 'proj-2',
    name: 'Mobile App MVP',
    clientId: 'client-2',
    clientName: 'StartupXYZ',
    status: 'active',
    quotedAmount: 28000,
    actualRevenue: 32000,
    estimatedCosts: 18000,
    actualCosts: 24000,
    grossProfit: 8000,
    grossMargin: 25,
    estimatedHours: 200,
    actualHours: 260,
    billableHours: 240,
    nonBillableHours: 20,
    hoursVariance: 60,
    quotedRate: 140,
    effectiveRate: 133.33,
    costPerHour: 92.31,
    laborCosts: 20800,
    materialCosts: 1200,
    toolsCosts: 1500,
    overheadAllocation: 500,
    profitabilityLevel: 'marginal',
    isOverBudget: true,
    isOverTime: true,
    riskFactors: ['Scope creep', 'Frequent revisions', 'Underestimated complexity'],
    startDate: '2024-02-01',
    daysActive: 48
  },
  {
    id: 'proj-3',
    name: 'API Integration Suite',
    clientId: 'client-3',
    clientName: 'Global Enterprises',
    status: 'completed',
    quotedAmount: 18000,
    actualRevenue: 18500,
    estimatedCosts: 10000,
    actualCosts: 9200,
    grossProfit: 9300,
    grossMargin: 50.27,
    estimatedHours: 120,
    actualHours: 96,
    billableHours: 96,
    nonBillableHours: 0,
    hoursVariance: -24,
    quotedRate: 150,
    effectiveRate: 192.71,
    costPerHour: 95.83,
    laborCosts: 8000,
    materialCosts: 500,
    toolsCosts: 500,
    overheadAllocation: 200,
    profitabilityLevel: 'highly_profitable',
    isOverBudget: false,
    isOverTime: false,
    riskFactors: [],
    startDate: '2024-01-20',
    endDate: '2024-02-28',
    daysActive: 39
  }
]

const mockClientProfitability: ClientProfitability[] = [
  {
    id: 'client-1',
    name: 'TechCorp Inc',
    company: 'TechCorp Inc',
    totalRevenue: 125000,
    revenueThisYear: 85000,
    revenueLastYear: 40000,
    revenueGrowth: 112.5,
    avgProjectValue: 31250,
    totalCosts: 75000,
    totalProfit: 50000,
    profitMargin: 40,
    effectiveRate: 156.25,
    projectCount: 4,
    activeProjects: 1,
    completedProjects: 3,
    totalHours: 800,
    avgHoursPerProject: 200,
    onTimeDelivery: 100,
    scopeCreep: 5,
    revisionRate: 8,
    paymentSpeed: 15,
    clientSince: '2022-06-15',
    lastProjectDate: '2024-03-15',
    communicationScore: 92,
    satisfactionScore: 95,
    profitabilityLevel: 'profitable',
    tier: 'platinum',
    riskLevel: 'low',
    churnRisk: 5,
    upsellPotential: 85,
    recommendedActions: ['Propose annual retainer', 'Discuss roadmap expansion']
  },
  {
    id: 'client-2',
    name: 'StartupXYZ',
    company: 'StartupXYZ',
    totalRevenue: 65000,
    revenueThisYear: 52000,
    revenueLastYear: 13000,
    revenueGrowth: 300,
    avgProjectValue: 21666,
    totalCosts: 48000,
    totalProfit: 17000,
    profitMargin: 26.15,
    effectiveRate: 136.84,
    projectCount: 3,
    activeProjects: 1,
    completedProjects: 2,
    totalHours: 475,
    avgHoursPerProject: 158,
    onTimeDelivery: 66,
    scopeCreep: 25,
    revisionRate: 20,
    paymentSpeed: 35,
    clientSince: '2023-08-01',
    lastProjectDate: '2024-03-18',
    communicationScore: 70,
    satisfactionScore: 78,
    profitabilityLevel: 'marginal',
    tier: 'silver',
    riskLevel: 'medium',
    churnRisk: 25,
    upsellPotential: 40,
    recommendedActions: ['Implement stricter scope control', 'Discuss process improvements', 'Review pricing']
  },
  {
    id: 'client-3',
    name: 'Global Enterprises',
    company: 'Global Enterprises Ltd',
    totalRevenue: 97500,
    revenueThisYear: 62500,
    revenueLastYear: 35000,
    revenueGrowth: 78.6,
    avgProjectValue: 32500,
    totalCosts: 52500,
    totalProfit: 45000,
    profitMargin: 46.15,
    effectiveRate: 187.50,
    projectCount: 3,
    activeProjects: 0,
    completedProjects: 3,
    totalHours: 520,
    avgHoursPerProject: 173,
    onTimeDelivery: 100,
    scopeCreep: 3,
    revisionRate: 5,
    paymentSpeed: 7,
    clientSince: '2022-01-10',
    lastProjectDate: '2024-02-28',
    communicationScore: 95,
    satisfactionScore: 98,
    profitabilityLevel: 'highly_profitable',
    tier: 'gold',
    riskLevel: 'low',
    churnRisk: 10,
    upsellPotential: 90,
    recommendedActions: ['Propose new project', 'Discuss quarterly retainer']
  }
]

const mockServiceProfitability: ServiceProfitability[] = [
  {
    id: 'svc-1',
    name: 'Web Development',
    category: 'Development',
    projectCount: 12,
    totalHours: 1440,
    avgProjectHours: 120,
    totalRevenue: 180000,
    avgProjectRevenue: 15000,
    avgHourlyRate: 125,
    totalCosts: 100800,
    avgProjectCosts: 8400,
    avgCostPerHour: 70,
    totalProfit: 79200,
    avgProjectProfit: 6600,
    profitMargin: 44,
    profitPerHour: 55,
    demandTrend: 'increasing',
    marginTrend: 'stable',
    pricingRecommendation: 'increase',
    recommendedRate: 140,
    notes: 'High demand allows for rate increase'
  },
  {
    id: 'svc-2',
    name: 'Mobile Development',
    category: 'Development',
    projectCount: 6,
    totalHours: 960,
    avgProjectHours: 160,
    totalRevenue: 134400,
    avgProjectRevenue: 22400,
    avgHourlyRate: 140,
    totalCosts: 86400,
    avgProjectCosts: 14400,
    avgCostPerHour: 90,
    totalProfit: 48000,
    avgProjectProfit: 8000,
    profitMargin: 35.7,
    profitPerHour: 50,
    demandTrend: 'increasing',
    marginTrend: 'improving',
    pricingRecommendation: 'maintain',
    recommendedRate: 140,
    notes: 'Competitive rate for market'
  },
  {
    id: 'svc-3',
    name: 'UI/UX Design',
    category: 'Design',
    projectCount: 8,
    totalHours: 480,
    avgProjectHours: 60,
    totalRevenue: 57600,
    avgProjectRevenue: 7200,
    avgHourlyRate: 120,
    totalCosts: 28800,
    avgProjectCosts: 3600,
    avgCostPerHour: 60,
    totalProfit: 28800,
    avgProjectProfit: 3600,
    profitMargin: 50,
    profitPerHour: 60,
    demandTrend: 'stable',
    marginTrend: 'stable',
    pricingRecommendation: 'increase',
    recommendedRate: 135,
    notes: 'Strong margins support price increase'
  }
]

const mockInsights: ProfitInsight[] = [
  {
    id: 'insight-1',
    type: 'opportunity',
    category: 'pricing',
    title: 'Pricing Opportunity Detected',
    description: 'Your effective hourly rate for web development is 15% below market average. Consider raising rates for new projects.',
    impact: 'high',
    metric: 'hourlyRate',
    value: 125,
    target: 145,
    actions: ['Review competitor pricing', 'Test higher rates on new leads', 'Create premium service tier']
  },
  {
    id: 'insight-2',
    type: 'warning',
    category: 'client',
    title: 'Client Profitability Declining',
    description: 'StartupXYZ projects consistently run over budget due to scope changes. Consider implementing change request fees.',
    impact: 'medium',
    metric: 'projectMargin',
    value: 25,
    target: 40,
    actions: ['Review scope management process', 'Implement change request policy', 'Schedule client meeting']
  },
  {
    id: 'insight-3',
    type: 'success',
    category: 'efficiency',
    title: 'Efficiency Improvement',
    description: 'API Integration projects are completing 20% under estimated hours. Consider updating estimation templates.',
    impact: 'medium',
    actions: ['Update project templates', 'Document best practices', 'Share with team']
  }
]

const mockTrends: ProfitTrend[] = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(2024, i, 1).toISOString().split('T')[0],
  revenue: 22000 + Math.random() * 8000 + i * 1000,
  costs: 11000 + Math.random() * 3000 + i * 300,
  profit: 11000 + Math.random() * 5000 + i * 700,
  margin: 45 + Math.random() * 10,
  movingAverage: 12000 + i * 600,
  forecast: i >= 9 ? 15000 + (i - 8) * 1500 : undefined
}))

// ============================================================================
// HOOK
// ============================================================================

interface UseProfitabilityOptions {
  timeFrame?: 'month' | 'quarter' | 'year' | 'all'
}

// Empty defaults for when no data is available
const emptyOverview: ProfitOverview = {
  totalRevenue: 0, totalCosts: 0, grossProfit: 0, grossMargin: 0,
  netProfit: 0, netMargin: 0, operatingExpenses: 0, overheadCosts: 0,
  directCosts: 0, profitPerHour: 0, profitPerProject: 0, profitPerClient: 0,
  targetMargin: 30, marginVariance: 0, revenueAtRisk: 0
}

export function useProfitability(options: UseProfitabilityOptions = {}) {
  const { timeFrame = 'year' } = options

  const [overview, setOverview] = useState<ProfitOverview | null>(null)
  const [projectProfitability, setProjectProfitability] = useState<ProjectProfitability[]>([])
  const [clientProfitability, setClientProfitability] = useState<ClientProfitability[]>([])
  const [serviceProfitability, setServiceProfitability] = useState<ServiceProfitability[]>([])
  const [insights, setInsights] = useState<ProfitInsight[]>([])
  const [trends, setTrends] = useState<ProfitTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfitability = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/business-intelligence?type=profitability&timeFrame=${timeFrame}`)
      const result = await response.json()

      if (response.ok && result.projectProfitability) {
        setOverview({
          ...emptyOverview,
          totalRevenue: result.summary?.totalRevenue || 0,
          totalCosts: result.summary?.totalRevenue - result.summary?.totalProfit || 0,
          grossProfit: result.summary?.totalProfit || 0,
          grossMargin: result.summary?.overallMargin || 0
        })
        setProjectProfitability(result.projectProfitability || [])
        setClientProfitability(result.clientProfitability || [])
        setServiceProfitability([])
        setInsights([])
        setTrends([])
      } else {
        setOverview(emptyOverview)
        setProjectProfitability([])
        setClientProfitability([])
        setServiceProfitability([])
        setInsights([])
        setTrends([])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profitability data'))
      setOverview(emptyOverview)
      setProjectProfitability([])
      setClientProfitability([])
      setServiceProfitability([])
      setInsights([])
      setTrends([])
    } finally {
      setIsLoading(false)
    }
  }, [timeFrame])

  // Analysis functions
  const calculateProjectROI = useCallback((project: ProjectProfitability) => {
    if (project.actualCosts === 0) return 0
    return ((project.actualRevenue - project.actualCosts) / project.actualCosts) * 100
  }, [])

  const getProfitabilityLevel = useCallback((margin: number): ProfitabilityLevel => {
    if (margin >= 50) return 'highly_profitable'
    if (margin >= 30) return 'profitable'
    if (margin >= 15) return 'marginal'
    if (margin >= 0) return 'break_even'
    return 'loss_making'
  }, [])

  const getClientTier = useCallback((client: ClientProfitability) => {
    const score = (client.profitMargin * 0.4) +
                  (client.satisfactionScore * 0.3) +
                  ((100 - client.churnRisk) * 0.3)
    if (score >= 80) return 'platinum'
    if (score >= 60) return 'gold'
    if (score >= 40) return 'silver'
    return 'bronze'
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchProfitability()
  }, [fetchProfitability])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const highlyProfitableProjects = useMemo(() =>
    projectProfitability.filter(p => p.profitabilityLevel === 'highly_profitable'),
    [projectProfitability]
  )

  const atRiskProjects = useMemo(() =>
    projectProfitability.filter(p => p.isOverBudget || p.isOverTime),
    [projectProfitability]
  )

  const topClients = useMemo(() =>
    [...clientProfitability].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 5),
    [clientProfitability]
  )

  const unprofitableClients = useMemo(() =>
    clientProfitability.filter(c => c.profitabilityLevel === 'marginal' || c.profitabilityLevel === 'loss_making'),
    [clientProfitability]
  )

  const bestServices = useMemo(() =>
    [...serviceProfitability].sort((a, b) => b.profitMargin - a.profitMargin).slice(0, 3),
    [serviceProfitability]
  )

  const highImpactInsights = useMemo(() =>
    insights.filter(i => i.impact === 'high'),
    [insights]
  )

  const avgProjectMargin = useMemo(() => {
    if (!projectProfitability.length) return 0
    return projectProfitability.reduce((sum, p) => sum + p.grossMargin, 0) / projectProfitability.length
  }, [projectProfitability])

  const avgClientMargin = useMemo(() => {
    if (!clientProfitability.length) return 0
    return clientProfitability.reduce((sum, c) => sum + c.profitMargin, 0) / clientProfitability.length
  }, [clientProfitability])

  // Format helpers
  const formatCurrency = useCallback((value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value),
    []
  )

  const formatPercentage = useCallback((value: number) =>
    `${value.toFixed(1)}%`,
    []
  )

  return {
    // Data
    overview,
    projectProfitability,
    clientProfitability,
    serviceProfitability,
    insights,
    trends,

    // Computed
    highlyProfitableProjects,
    atRiskProjects,
    topClients,
    unprofitableClients,
    bestServices,
    highImpactInsights,
    avgProjectMargin,
    avgClientMargin,

    // State
    isLoading,
    error,

    // Actions
    refresh,

    // Analysis
    calculateProjectROI,
    getProfitabilityLevel,
    getClientTier,

    // Formatters
    formatCurrency,
    formatPercentage
  }
}

export default useProfitability
