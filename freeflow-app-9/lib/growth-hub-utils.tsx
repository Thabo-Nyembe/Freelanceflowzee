/**
 * Growth Hub Utilities
 *
 * Comprehensive growth strategy management with AI-powered recommendations,
 * personalized roadmaps, user type-specific strategies, and business scaling tools.
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('GrowthHubUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserType = 'freelancer' | 'entrepreneur' | 'startup' | 'enterprise' | 'creative'
export type GrowthGoalType = 'monetize' | 'acquire' | 'scale' | 'optimize'
export type StrategyStatus = 'draft' | 'active' | 'completed' | 'paused' | 'archived'
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low'
export type TimeframeType = '3-months' | '6-months' | '12-months' | '24-months'
export type MetricType = 'revenue' | 'clients' | 'efficiency' | 'profit' | 'growth-rate'
export type ActionCategory = 'pricing' | 'marketing' | 'operations' | 'sales' | 'product' | 'team'

export interface GrowthStrategy {
  id: string
  userId: string
  name: string
  userType: UserType
  goalType: GrowthGoalType
  status: StrategyStatus
  currentRevenue: number
  targetRevenue: number
  timeline: number // months
  quickWins: QuickWin[]
  monthlyPlan: MonthlyPlan[]
  priorityActions: PriorityAction[]
  challenges: string[]
  estimatedImpact: EstimatedImpact
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface QuickWin {
  id: string
  action: string
  category: ActionCategory
  estimatedRevenue: number
  timeToImplement: number // days
  difficulty: PriorityLevel
  completed: boolean
  completedAt?: string
}

export interface MonthlyPlan {
  month: number
  revenue: number
  revenueTarget: number
  actions: string[]
  milestones: Milestone[]
  kpis: KPI[]
  completed: boolean
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  completed: boolean
  completedAt?: string
}

export interface KPI {
  id: string
  name: string
  metric: MetricType
  current: number
  target: number
  unit: string
}

export interface PriorityAction {
  id: string
  title: string
  description: string
  category: ActionCategory
  priority: PriorityLevel
  estimatedImpact: number // percentage
  timeframe: TimeframeType
  resources: string[]
  dependencies: string[]
  completed: boolean
}

export interface EstimatedImpact {
  revenueIncrease: number // percentage
  timeframe: string
  probability: 'low' | 'medium' | 'high' | 'very-high'
  roi: number
  confidenceScore: number // 0-100
}

export interface GrowthMetric {
  id: string
  userId: string
  strategyId: string
  month: number
  date: string
  revenue: number
  clients: number
  averageProjectValue: number
  efficiencyScore: number
  profitMargin: number
  growthRate: number
  clientAcquisitionCost: number
  lifetimeValue: number
}

export interface UserTypeProfile {
  type: string
  displayName: string
  icon: string
  color: string
  quickWins: string[]
  challenges: string[]
  recommendedStrategies: GrowthGoalType[]
  averageRevenue: number
  growthPotential: number
}

export interface GrowthTemplate {
  id: string
  name: string
  userType: UserType
  goalType: GrowthGoalType
  description: string
  timeline: number
  quickWins: string[]
  milestones: string[]
  estimatedImpact: number
  usageCount: number
}

export interface BusinessData {
  userType: UserType
  currentRevenue: number
  targetRevenue: number
  skills: string[]
  market: string
  timeline: number
  challenges: string[]
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const userTypeData: UserTypeProfile[] = [
  {
    type: 'freelancer',
    displayName: 'Freelancers',
    icon: 'Briefcase',
    color: 'bg-blue-100 text-blue-700',
    quickWins: [
      'Increase rates by 30% in 90 days',
      'Build 3-tier service packages',
      'Create email templates for common tasks',
      'Implement time tracking & reporting'
    ],
    challenges: [
      'Feast or famine income',
      'Trading time for money',
      'Limited scalability',
      'Client acquisition'
    ],
    recommendedStrategies: ['monetize', 'acquire', 'optimize'],
    averageRevenue: 75000,
    growthPotential: 200
  },
  {
    type: 'entrepreneur',
    displayName: 'Entrepreneurs',
    icon: 'Rocket',
    color: 'bg-purple-100 text-purple-700',
    quickWins: [
      'Validate MVP with 10 customers',
      'Create growth funnel',
      'Build founding team',
      'Secure first $10K MRR'
    ],
    challenges: [
      'Product-market fit',
      'Scaling customer acquisition',
      'Funding & cash flow',
      'Team building'
    ],
    recommendedStrategies: ['acquire', 'scale', 'optimize'],
    averageRevenue: 150000,
    growthPotential: 500
  },
  {
    type: 'startup',
    displayName: 'Startups',
    icon: 'BarChart3',
    color: 'bg-green-100 text-green-700',
    quickWins: [
      'Optimize conversion funnel',
      'Reduce CAC by 40%',
      'Increase LTV 2x',
      'Build investor pitch deck'
    ],
    challenges: [
      'Achieving product-market fit',
      'Scaling efficiently',
      'Fundraising',
      'Competitive differentiation'
    ],
    recommendedStrategies: ['scale', 'optimize', 'acquire'],
    averageRevenue: 500000,
    growthPotential: 1000
  },
  {
    type: 'enterprise',
    displayName: 'Enterprises',
    icon: 'Award',
    color: 'bg-indigo-100 text-indigo-700',
    quickWins: [
      'Digital transformation roadmap',
      'Process optimization (20% efficiency)',
      'Innovation framework',
      'Market expansion strategy'
    ],
    challenges: [
      'Innovation vs bureaucracy',
      'Legacy system modernization',
      'Agile transformation',
      'Talent retention'
    ],
    recommendedStrategies: ['optimize', 'scale', 'monetize'],
    averageRevenue: 5000000,
    growthPotential: 300
  },
  {
    type: 'creative',
    displayName: 'Creatives',
    icon: 'Lightbulb',
    color: 'bg-pink-100 text-pink-700',
    quickWins: [
      'Portfolio positioning strategy',
      'Premium pricing justification',
      'Creative brief templates',
      'Client onboarding system'
    ],
    challenges: [
      'Undercharging for work',
      'Scope creep management',
      'Work-life balance',
      'Finding ideal clients'
    ],
    recommendedStrategies: ['monetize', 'acquire', 'optimize'],
    averageRevenue: 60000,
    growthPotential: 250
  }
]

const actionCategories: ActionCategory[] = ['pricing', 'marketing', 'operations', 'sales', 'product', 'team']

const quickWinTemplates = [
  { action: 'Optimize pricing strategy for 30% increase', category: 'pricing' as ActionCategory, revenue: 15000, time: 7 },
  { action: 'Launch cold outreach campaign (50 prospects)', category: 'marketing' as ActionCategory, revenue: 8000, time: 14 },
  { action: 'Create 3-tier service packages', category: 'product' as ActionCategory, revenue: 12000, time: 10 },
  { action: 'Automate 5 repetitive tasks', category: 'operations' as ActionCategory, revenue: 5000, time: 21 },
  { action: 'Build strategic partnership with complementary service', category: 'sales' as ActionCategory, revenue: 20000, time: 30 },
  { action: 'Implement referral program', category: 'marketing' as ActionCategory, revenue: 10000, time: 14 },
  { action: 'Create productized service offering', category: 'product' as ActionCategory, revenue: 25000, time: 45 },
  { action: 'Hire virtual assistant for admin tasks', category: 'team' as ActionCategory, revenue: 8000, time: 7 },
  { action: 'Launch lead magnet campaign', category: 'marketing' as ActionCategory, revenue: 6000, time: 10 },
  { action: 'Optimize conversion funnel', category: 'sales' as ActionCategory, revenue: 18000, time: 21 }
]

const priorityActionTemplates = [
  {
    title: 'Increase rates by 30%',
    description: 'Research market rates and implement value-based pricing',
    category: 'pricing' as ActionCategory,
    impact: 30,
    timeframe: '3-months' as TimeframeType,
    resources: ['Pricing calculator', 'Market research', 'Client communication templates']
  },
  {
    title: 'Acquire 5 new clients',
    description: 'Launch systematic outreach campaign with proven scripts',
    category: 'sales' as ActionCategory,
    impact: 50,
    timeframe: '3-months' as TimeframeType,
    resources: ['CRM system', 'Email templates', 'Follow-up sequences']
  },
  {
    title: 'Automate 50% of admin tasks',
    description: 'Implement automation tools for invoicing, scheduling, and reporting',
    category: 'operations' as ActionCategory,
    impact: 20,
    timeframe: '6-months' as TimeframeType,
    resources: ['Automation tools', 'Process documentation', 'Time tracking']
  },
  {
    title: 'Build email list to 1000 subscribers',
    description: 'Create lead magnets and nurture sequences',
    category: 'marketing' as ActionCategory,
    impact: 40,
    timeframe: '6-months' as TimeframeType,
    resources: ['Email marketing platform', 'Content calendar', 'Lead magnets']
  },
  {
    title: 'Launch productized service',
    description: 'Package expertise into scalable offering with fixed pricing',
    category: 'product' as ActionCategory,
    impact: 60,
    timeframe: '6-months' as TimeframeType,
    resources: ['Service design framework', 'Pricing strategy', 'Sales page']
  }
]

export function generateMockGrowthStrategies(count: number = 20, userId: string = 'user-1'): GrowthStrategy[] {
  const strategies: GrowthStrategy[] = []
  const statuses: StrategyStatus[] = ['draft', 'active', 'completed', 'paused', 'archived']
  const userTypes: UserType[] = ['freelancer', 'entrepreneur', 'startup', 'enterprise', 'creative']
  const goalTypes: GrowthGoalType[] = ['monetize', 'acquire', 'scale', 'optimize']

  for (let i = 0; i < count; i++) {
    const userType = userTypes[i % userTypes.length]
    const goalType = goalTypes[i % goalTypes.length]
    const currentRevenue = Math.floor(Math.random() * 100000) + 50000
    const targetRevenue = currentRevenue + Math.floor(Math.random() * 200000) + 50000
    const timeline = [3, 6, 12, 24][i % 4]
    const status = i < 3 ? 'active' : statuses[i % statuses.length]

    // Generate quick wins
    const quickWins: QuickWin[] = quickWinTemplates.slice(0, 5).map((template, idx) => ({
      id: `qw-${i}-${idx}`,
      action: template.action,
      category: template.category,
      estimatedRevenue: template.revenue,
      timeToImplement: template.time,
      difficulty: (['critical', 'high', 'medium', 'low'] as PriorityLevel[])[idx % 4],
      completed: Math.random() > 0.5,
      completedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined
    }))

    // Generate monthly plan
    const monthlyPlan: MonthlyPlan[] = Array.from({ length: timeline }, (_, month) => {
      const progress = (month + 1) / timeline
      const monthRevenue = currentRevenue + (targetRevenue - currentRevenue) * progress

      return {
        month: month + 1,
        revenue: Math.floor(monthRevenue * (0.9 + Math.random() * 0.2)),
        revenueTarget: Math.floor(monthRevenue),
        actions: [
          `Action 1 for month ${month + 1}`,
          `Action 2 for month ${month + 1}`,
          `Action 3 for month ${month + 1}`
        ],
        milestones: [
          {
            id: `milestone-${i}-${month}-1`,
            title: `Month ${month + 1} Milestone`,
            description: `Key achievement for month ${month + 1}`,
            targetDate: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toISOString(),
            completed: month < 3 && Math.random() > 0.3,
            completedAt: month < 3 && Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
          }
        ],
        kpis: [
          {
            id: `kpi-${i}-${month}-revenue`,
            name: 'Monthly Revenue',
            metric: 'revenue' as MetricType,
            current: Math.floor(monthRevenue * 0.85),
            target: Math.floor(monthRevenue),
            unit: 'USD'
          },
          {
            id: `kpi-${i}-${month}-clients`,
            name: 'Active Clients',
            metric: 'clients' as MetricType,
            current: Math.floor(5 + month * 1.5),
            target: Math.floor(5 + month * 2),
            unit: 'clients'
          }
        ],
        completed: month < 2 && status === 'active'
      }
    })

    // Generate priority actions
    const priorityActions: PriorityAction[] = priorityActionTemplates.slice(0, 5).map((template, idx) => ({
      id: `pa-${i}-${idx}`,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: (['critical', 'high', 'medium', 'low'] as PriorityLevel[])[idx % 4],
      estimatedImpact: template.impact,
      timeframe: template.timeframe,
      resources: template.resources,
      dependencies: idx > 0 ? [`pa-${i}-${idx - 1}`] : [],
      completed: Math.random() > 0.6
    }))

    const revenueIncrease = ((targetRevenue - currentRevenue) / currentRevenue) * 100

    strategies.push({
      id: `strategy-${i + 1}`,
      userId,
      name: `${userTypeData.find(ut => ut.type === userType)?.displayName} ${goalType.charAt(0).toUpperCase() + goalType.slice(1)} Strategy`,
      userType,
      goalType,
      status,
      currentRevenue,
      targetRevenue,
      timeline,
      quickWins,
      monthlyPlan,
      priorityActions,
      challenges: userTypeData.find(ut => ut.type === userType)?.challenges || [],
      estimatedImpact: {
        revenueIncrease: Math.floor(revenueIncrease),
        timeframe: `${timeline} months`,
        probability: revenueIncrease > 100 ? 'medium' : 'high',
        roi: Math.floor(200 + Math.random() * 300),
        confidenceScore: Math.floor(70 + Math.random() * 25)
      },
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: status === 'completed' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    })
  }

  logger.debug('Generated mock growth strategies', { count: strategies.length })
  return strategies
}

export function generateMockGrowthMetrics(count: number = 50, userId: string = 'user-1'): GrowthMetric[] {
  const metrics: GrowthMetric[] = []
  const strategies = generateMockGrowthStrategies(3, userId)

  let baseRevenue = 50000

  for (let i = 0; i < count; i++) {
    const strategy = strategies[i % strategies.length]
    const month = Math.floor(i / 3) + 1
    const date = new Date(Date.now() - (count - i) * 7 * 24 * 60 * 60 * 1000)

    // Progressive growth
    const growthRate = 5 + Math.random() * 15
    const revenue = Math.floor(baseRevenue * (1 + growthRate / 100))
    baseRevenue = revenue

    metrics.push({
      id: `metric-${i + 1}`,
      userId,
      strategyId: strategy.id,
      month,
      date: date.toISOString(),
      revenue,
      clients: Math.floor(5 + month * 1.5 + Math.random() * 5),
      averageProjectValue: Math.floor(revenue / (5 + month)),
      efficiencyScore: Math.floor(60 + Math.random() * 35),
      profitMargin: Math.floor(20 + Math.random() * 30),
      growthRate: Math.floor(growthRate * 10) / 10,
      clientAcquisitionCost: Math.floor(500 + Math.random() * 1500),
      lifetimeValue: Math.floor(5000 + Math.random() * 15000)
    })
  }

  logger.debug('Generated mock growth metrics', { count: metrics.length })
  return metrics
}

export function generateMockGrowthTemplates(count: number = 15): GrowthTemplate[] {
  const templates: GrowthTemplate[] = []
  const userTypes: UserType[] = ['freelancer', 'entrepreneur', 'startup', 'enterprise', 'creative']
  const goalTypes: GrowthGoalType[] = ['monetize', 'acquire', 'scale', 'optimize']

  for (let i = 0; i < count; i++) {
    const userType = userTypes[i % userTypes.length]
    const goalType = goalTypes[i % goalTypes.length]
    const userProfile = userTypeData.find(ut => ut.type === userType)!

    templates.push({
      id: `template-${i + 1}`,
      name: `${userProfile.displayName} ${goalType.charAt(0).toUpperCase() + goalType.slice(1)} Blueprint`,
      userType,
      goalType,
      description: `Proven ${goalType} strategy for ${userProfile.displayName.toLowerCase()}`,
      timeline: [3, 6, 12][i % 3],
      quickWins: userProfile.quickWins.slice(0, 3),
      milestones: [
        `Month 1: Foundation & Quick Wins`,
        `Month 3: Growth Acceleration`,
        `Month 6: Scale & Optimize`,
        `Month 12: Market Leadership`
      ].slice(0, [3, 4, 5][i % 3]),
      estimatedImpact: Math.floor(50 + Math.random() * 150),
      usageCount: Math.floor(Math.random() * 500)
    })
  }

  logger.debug('Generated mock growth templates', { count: templates.length })
  return templates
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateGrowthStats(strategies: GrowthStrategy[]) {
  const activeStrategies = strategies.filter(s => s.status === 'active')
  const completedStrategies = strategies.filter(s => s.status === 'completed')

  const totalRevenueGoal = activeStrategies.reduce((sum, s) => sum + s.targetRevenue, 0)
  const totalCurrentRevenue = activeStrategies.reduce((sum, s) => sum + s.currentRevenue, 0)
  const averageGrowthRate = activeStrategies.length > 0
    ? activeStrategies.reduce((sum, s) => sum + s.estimatedImpact.revenueIncrease, 0) / activeStrategies.length
    : 0

  const completionRate = strategies.length > 0
    ? (completedStrategies.length / strategies.length) * 100
    : 0

  return {
    activeStrategies: activeStrategies.length,
    completedStrategies: completedStrategies.length,
    totalStrategies: strategies.length,
    totalRevenueGoal,
    totalCurrentRevenue,
    revenueGap: totalRevenueGoal - totalCurrentRevenue,
    averageGrowthRate: Math.floor(averageGrowthRate),
    completionRate: Math.floor(completionRate),
    quickWinsCompleted: strategies.reduce((sum, s) =>
      sum + s.quickWins.filter(qw => qw.completed).length, 0
    ),
    totalQuickWins: strategies.reduce((sum, s) => sum + s.quickWins.length, 0)
  }
}

export function searchGrowthStrategies(strategies: GrowthStrategy[], query: string): GrowthStrategy[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) return strategies

  return strategies.filter(strategy =>
    strategy.name.toLowerCase().includes(lowerQuery) ||
    strategy.userType.toLowerCase().includes(lowerQuery) ||
    strategy.goalType.toLowerCase().includes(lowerQuery) ||
    strategy.challenges.some(c => c.toLowerCase().includes(lowerQuery))
  )
}

export function filterGrowthStrategies(
  strategies: GrowthStrategy[],
  filters: {
    userType?: UserType
    goalType?: GrowthGoalType
    status?: StrategyStatus
    minRevenue?: number
    maxRevenue?: number
  }
): GrowthStrategy[] {
  return strategies.filter(strategy => {
    if (filters.userType && strategy.userType !== filters.userType) return false
    if (filters.goalType && strategy.goalType !== filters.goalType) return false
    if (filters.status && strategy.status !== filters.status) return false
    if (filters.minRevenue && strategy.targetRevenue < filters.minRevenue) return false
    if (filters.maxRevenue && strategy.targetRevenue > filters.maxRevenue) return false
    return true
  })
}

export function sortGrowthStrategies(
  strategies: GrowthStrategy[],
  sortBy: 'name' | 'revenue' | 'impact' | 'date' = 'date',
  order: 'asc' | 'desc' = 'desc'
): GrowthStrategy[] {
  const sorted = [...strategies].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'revenue':
        comparison = a.targetRevenue - b.targetRevenue
        break
      case 'impact':
        comparison = a.estimatedImpact.revenueIncrease - b.estimatedImpact.revenueIncrease
        break
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}

export function getUserTypeProfile(userType: UserType): UserTypeProfile | undefined {
  return userTypeData.find(ut => ut.type === userType)
}

export function calculateMonthlyProgress(strategy: GrowthStrategy, currentMonth: number) {
  const plan = strategy.monthlyPlan.find(p => p.month === currentMonth)
  if (!plan) return null

  const revenueProgress = (plan.revenue / plan.revenueTarget) * 100
  const milestonesCompleted = plan.milestones.filter(m => m.completed).length
  const milestonesTotal = plan.milestones.length
  const kpisOnTrack = plan.kpis.filter(k => k.current >= k.target * 0.9).length

  return {
    month: currentMonth,
    revenueProgress: Math.floor(revenueProgress),
    revenue: plan.revenue,
    target: plan.revenueTarget,
    milestonesCompleted,
    milestonesTotal,
    milestoneProgress: milestonesTotal > 0 ? Math.floor((milestonesCompleted / milestonesTotal) * 100) : 0,
    kpisOnTrack,
    kpisTotal: plan.kpis.length,
    onTrack: revenueProgress >= 90 && milestonesCompleted / milestonesTotal >= 0.7
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function getRecommendedActions(strategy: GrowthStrategy, currentMonth: number): PriorityAction[] {
  const currentPlan = strategy.monthlyPlan.find(p => p.month === currentMonth)
  if (!currentPlan) return []

  // Get incomplete priority actions for current timeframe
  return strategy.priorityActions
    .filter(action => !action.completed)
    .filter(action => {
      const monthsFromNow = parseInt(action.timeframe.split('-')[0])
      return monthsFromNow >= currentMonth
    })
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 5)
}
