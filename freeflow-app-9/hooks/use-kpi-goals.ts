'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// KPI Goals & Targets Hook
// Helps freelancers, entrepreneurs, agencies, and enterprises set and track
// business goals with intelligent recommendations and progress tracking
// ============================================================================

export interface KPIGoal {
  id: string
  name: string
  description: string
  category: KPICategory
  targetValue: number
  currentValue: number
  unit: string // e.g., '$', '%', 'hours', 'clients'
  startDate: string
  endDate: string
  status: GoalStatus
  priority: 'critical' | 'high' | 'medium' | 'low'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  milestones: GoalMilestone[]
  history: GoalProgress[]
  linkedMetrics: string[] // IDs of related metrics
  owner?: string
  team?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type KPICategory =
  | 'revenue'
  | 'profitability'
  | 'clients'
  | 'projects'
  | 'efficiency'
  | 'growth'
  | 'retention'
  | 'cash_flow'
  | 'marketing'
  | 'operations'

export type GoalStatus =
  | 'not_started'
  | 'on_track'
  | 'at_risk'
  | 'behind'
  | 'achieved'
  | 'exceeded'
  | 'abandoned'

export interface GoalMilestone {
  id: string
  name: string
  targetValue: number
  targetDate: string
  achieved: boolean
  achievedDate?: string
  notes?: string
}

export interface GoalProgress {
  date: string
  value: number
  percentComplete: number
  notes?: string
  source?: string // where the data came from
}

export interface KPITemplate {
  id: string
  name: string
  description: string
  category: KPICategory
  userType: ('freelancer' | 'entrepreneur' | 'agency' | 'enterprise')[]
  defaultTarget: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  benchmarks: {
    poor: number
    average: number
    good: number
    excellent: number
  }
  tips: string[]
  relatedKPIs: string[]
}

export interface GoalDashboard {
  totalGoals: number
  activeGoals: number
  achievedGoals: number
  atRiskGoals: number
  behindGoals: number
  overallProgress: number // 0-100
  goalsByCategory: Record<KPICategory, number>
  goalsByStatus: Record<GoalStatus, number>
  upcomingMilestones: GoalMilestone[]
  recentAchievements: KPIGoal[]
  recommendations: GoalRecommendation[]
}

export interface GoalRecommendation {
  id: string
  type: 'new_goal' | 'adjust_target' | 'extend_deadline' | 'add_milestone' | 'focus_area'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestedGoal?: Partial<KPIGoal>
  relatedGoalId?: string
}

export interface GoalInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'celebration'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  confidence: number
  relatedGoals: string[]
  suggestedAction?: string
  timestamp: string
}

export interface UseKPIGoalsOptions {
  userId?: string
  teamId?: string
  categories?: KPICategory[]
  statuses?: GoalStatus[]
  autoRefresh?: boolean
  refreshInterval?: number
}

// Default KPI Templates - used as reference when no data from API
const defaultKPITemplates: KPITemplate[] = [
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue Target',
    description: 'Total revenue generated in a month',
    category: 'revenue',
    userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
    defaultTarget: 10000,
    unit: '$',
    frequency: 'monthly',
    benchmarks: { poor: 3000, average: 7500, good: 15000, excellent: 30000 },
    tips: ['Focus on high-value clients', 'Increase project rates', 'Add recurring revenue streams'],
    relatedKPIs: ['client-acquisition', 'average-project-value']
  },
  {
    id: 'profit-margin',
    name: 'Net Profit Margin',
    description: 'Percentage of revenue that becomes profit',
    category: 'profitability',
    userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
    defaultTarget: 30,
    unit: '%',
    frequency: 'monthly',
    benchmarks: { poor: 10, average: 20, good: 35, excellent: 50 },
    tips: ['Reduce overhead costs', 'Optimize pricing', 'Automate repetitive tasks'],
    relatedKPIs: ['gross-margin', 'operating-costs']
  },
  {
    id: 'client-acquisition',
    name: 'New Clients per Month',
    description: 'Number of new clients acquired monthly',
    category: 'clients',
    userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
    defaultTarget: 3,
    unit: 'clients',
    frequency: 'monthly',
    benchmarks: { poor: 0, average: 2, good: 5, excellent: 10 },
    tips: ['Improve marketing efforts', 'Ask for referrals', 'Optimize conversion funnel'],
    relatedKPIs: ['client-retention', 'ltv-cac-ratio']
  },
  {
    id: 'utilization-rate',
    name: 'Billable Utilization Rate',
    description: 'Percentage of time spent on billable work',
    category: 'efficiency',
    userType: ['freelancer', 'entrepreneur', 'agency'],
    defaultTarget: 70,
    unit: '%',
    frequency: 'monthly',
    benchmarks: { poor: 40, average: 60, good: 75, excellent: 85 },
    tips: ['Minimize admin time', 'Batch similar tasks', 'Use automation tools'],
    relatedKPIs: ['hourly-rate', 'project-completion']
  },
  {
    id: 'cash-runway',
    name: 'Cash Runway',
    description: 'Months of operating expenses covered by cash',
    category: 'cash_flow',
    userType: ['entrepreneur', 'agency', 'enterprise'],
    defaultTarget: 6,
    unit: 'months',
    frequency: 'monthly',
    benchmarks: { poor: 1, average: 3, good: 6, excellent: 12 },
    tips: ['Build emergency fund', 'Diversify income', 'Reduce fixed costs'],
    relatedKPIs: ['monthly-expenses', 'profit-margin']
  }
]

export function useKPIGoals(options: UseKPIGoalsOptions = {}) {
  const {
    userId,
    teamId,
    categories,
    statuses,
    autoRefresh = true,
    refreshInterval = 300000 // 5 minutes
  } = options

  // State
  const [goals, setGoals] = useState<KPIGoal[]>([])
  const [templates, setTemplates] = useState<KPITemplate[]>([])
  const [insights, setInsights] = useState<GoalInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch goals from API
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (teamId) params.append('teamId', teamId)
      if (categories?.length) params.append('categories', categories.join(','))
      if (statuses?.length) params.append('statuses', statuses.join(','))

      const [goalsRes, templatesRes, insightsRes] = await Promise.all([
        fetch(`/api/kpi/goals?${params}`),
        fetch('/api/kpi/templates'),
        fetch(`/api/kpi/insights?${params}`)
      ])

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        setGoals(Array.isArray(goalsData) ? goalsData : [])
      } else {
        setGoals([])
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(Array.isArray(templatesData) ? templatesData : defaultKPITemplates)
      } else {
        setTemplates(defaultKPITemplates)
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(Array.isArray(insightsData) ? insightsData : [])
      } else {
        setInsights([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI goals')
      setGoals([])
      setTemplates(defaultKPITemplates)
      setInsights([])
    } finally {
      setLoading(false)
    }
  }, [userId, teamId, categories, statuses])

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchGoals()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchGoals, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchGoals, autoRefresh, refreshInterval])

  // Create a new goal
  const createGoal = useCallback(async (goalData: Omit<KPIGoal, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    try {
      const newGoal: KPIGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        history: [{
          date: new Date().toISOString().split('T')[0],
          value: goalData.currentValue,
          percentComplete: goalData.targetValue > 0 ? (goalData.currentValue / goalData.targetValue) * 100 : 0
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch('/api/kpi/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      })

      if (!response.ok) {
        // If API fails, still update local state
        setGoals(prev => [...prev, newGoal])
        return newGoal
      }

      const created = await response.json()
      setGoals(prev => [...prev, created])
      return created
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create goal')
    }
  }, [])

  // Update a goal
  const updateGoal = useCallback(async (goalId: string, updates: Partial<KPIGoal>) => {
    try {
      const updatedGoal = goals.find(g => g.id === goalId)
      if (!updatedGoal) throw new Error('Goal not found')

      const merged = { ...updatedGoal, ...updates, updatedAt: new Date().toISOString() }

      const response = await fetch(`/api/kpi/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        // If API fails, still update local state
        setGoals(prev => prev.map(g => g.id === goalId ? merged : g))
        return merged
      }

      const updated = await response.json()
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g))
      return updated
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update goal')
    }
  }, [goals])

  // Delete a goal
  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      const response = await fetch(`/api/kpi/goals/${goalId}`, {
        method: 'DELETE'
      })

      // Update local state regardless of API response
      setGoals(prev => prev.filter(g => g.id !== goalId))

      if (!response.ok) {
        console.warn('Failed to delete goal from server, removed locally')
      }

      return true
    } catch (err) {
      // Still remove locally on error
      setGoals(prev => prev.filter(g => g.id !== goalId))
      console.warn('Error deleting goal from server:', err)
      return true
    }
  }, [])

  // Record progress
  const recordProgress = useCallback(async (goalId: string, value: number, notes?: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) throw new Error('Goal not found')

    const percentComplete = goal.targetValue > 0 ? (value / goal.targetValue) * 100 : 0
    const newProgress: GoalProgress = {
      date: new Date().toISOString().split('T')[0],
      value,
      percentComplete,
      notes,
      source: 'manual'
    }

    // Determine new status based on progress
    let newStatus: GoalStatus = goal.status
    const daysRemaining = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const expectedProgress = 100 - (daysRemaining / getDaysBetween(goal.startDate, goal.endDate) * 100)

    if (percentComplete >= 100) {
      newStatus = value > goal.targetValue ? 'exceeded' : 'achieved'
    } else if (percentComplete >= expectedProgress - 10) {
      newStatus = 'on_track'
    } else if (percentComplete >= expectedProgress - 25) {
      newStatus = 'at_risk'
    } else {
      newStatus = 'behind'
    }

    return updateGoal(goalId, {
      currentValue: value,
      status: newStatus,
      history: [...goal.history, newProgress]
    })
  }, [goals, updateGoal])

  // Add milestone to a goal
  const addMilestone = useCallback(async (goalId: string, milestone: Omit<GoalMilestone, 'id'>) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) throw new Error('Goal not found')

    const newMilestone: GoalMilestone = {
      ...milestone,
      id: `milestone-${Date.now()}`
    }

    return updateGoal(goalId, {
      milestones: [...goal.milestones, newMilestone]
    })
  }, [goals, updateGoal])

  // Mark milestone as achieved
  const achieveMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) throw new Error('Goal not found')

    const updatedMilestones = goal.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, achieved: true, achievedDate: new Date().toISOString().split('T')[0] }
      }
      return m
    })

    return updateGoal(goalId, { milestones: updatedMilestones })
  }, [goals, updateGoal])

  // Create goal from template
  const createGoalFromTemplate = useCallback(async (
    templateId: string,
    customizations: Partial<Omit<KPIGoal, 'id' | 'createdAt' | 'updatedAt' | 'history'>>
  ) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) throw new Error('Template not found')

    const now = new Date()
    let endDate: Date

    switch (template.frequency) {
      case 'daily':
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        break
      case 'quarterly':
        endDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
        break
      case 'yearly':
        endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        break
    }

    const goalData = {
      name: template.name,
      description: template.description,
      category: template.category,
      targetValue: template.defaultTarget,
      currentValue: 0,
      unit: template.unit,
      startDate: now.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'not_started' as GoalStatus,
      priority: 'medium' as const,
      frequency: template.frequency,
      milestones: [],
      linkedMetrics: template.relatedKPIs,
      tags: [template.category],
      ...customizations
    }

    return createGoal(goalData)
  }, [templates, createGoal])

  // Calculate dashboard metrics
  const dashboard = useMemo((): GoalDashboard => {
    const activeGoals = goals.filter(g => !['achieved', 'exceeded', 'abandoned'].includes(g.status))
    const achievedGoals = goals.filter(g => ['achieved', 'exceeded'].includes(g.status))
    const atRiskGoals = goals.filter(g => g.status === 'at_risk')
    const behindGoals = goals.filter(g => g.status === 'behind')

    // Calculate overall progress
    const totalProgress = goals.reduce((sum, g) => {
      return sum + (g.currentValue / g.targetValue) * 100
    }, 0)
    const overallProgress = goals.length > 0 ? totalProgress / goals.length : 0

    // Goals by category
    const goalsByCategory = goals.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1
      return acc
    }, {} as Record<KPICategory, number>)

    // Goals by status
    const goalsByStatus = goals.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1
      return acc
    }, {} as Record<GoalStatus, number>)

    // Upcoming milestones (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const upcomingMilestones = goals
      .flatMap(g => g.milestones.filter(m => {
        if (m.achieved) return false
        const targetDate = new Date(m.targetDate)
        return targetDate <= thirtyDaysFromNow && targetDate >= new Date()
      }))
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
      .slice(0, 5)

    // Generate recommendations
    const recommendations: GoalRecommendation[] = []

    // Check for missing critical KPIs
    const criticalCategories: KPICategory[] = ['revenue', 'profitability', 'cash_flow']
    criticalCategories.forEach(cat => {
      if (!goals.some(g => g.category === cat)) {
        const template = templates.find(t => t.category === cat)
        if (template) {
          recommendations.push({
            id: `rec-${cat}`,
            type: 'new_goal',
            title: `Add ${cat} tracking`,
            description: `You don't have any ${cat} goals. Consider adding one to track this critical metric.`,
            priority: 'high',
            actionable: true,
            suggestedGoal: {
              name: template.name,
              category: cat,
              targetValue: template.defaultTarget,
              unit: template.unit
            }
          })
        }
      }
    })

    // Check for at-risk goals
    atRiskGoals.forEach(goal => {
      recommendations.push({
        id: `rec-risk-${goal.id}`,
        type: 'focus_area',
        title: `Focus on ${goal.name}`,
        description: `This goal is at risk. Consider reallocating resources or adjusting the timeline.`,
        priority: 'high',
        actionable: true,
        relatedGoalId: goal.id
      })
    })

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      achievedGoals: achievedGoals.length,
      atRiskGoals: atRiskGoals.length,
      behindGoals: behindGoals.length,
      overallProgress: Math.min(100, Math.round(overallProgress)),
      goalsByCategory,
      goalsByStatus,
      upcomingMilestones,
      recentAchievements: achievedGoals.slice(-5),
      recommendations
    }
  }, [goals, templates])

  // Get templates for a specific user type
  const getTemplatesForUserType = useCallback((userType: 'freelancer' | 'entrepreneur' | 'agency' | 'enterprise') => {
    return templates.filter(t => t.userType.includes(userType))
  }, [templates])

  // Get benchmark for a goal
  const getBenchmark = useCallback((goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return null

    const template = templates.find(t =>
      t.category === goal.category && t.unit === goal.unit
    )

    if (!template) return null

    const { benchmarks } = template
    let level: 'poor' | 'average' | 'good' | 'excellent'

    if (goal.currentValue >= benchmarks.excellent) {
      level = 'excellent'
    } else if (goal.currentValue >= benchmarks.good) {
      level = 'good'
    } else if (goal.currentValue >= benchmarks.average) {
      level = 'average'
    } else {
      level = 'poor'
    }

    return {
      level,
      benchmarks,
      percentile: calculatePercentile(goal.currentValue, benchmarks)
    }
  }, [goals, templates])

  // Calculate progress velocity
  const getProgressVelocity = useCallback((goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal || goal.history.length < 2) return null

    const recentHistory = goal.history.slice(-7) // Last 7 data points
    if (recentHistory.length < 2) return null

    const startValue = recentHistory[0].value
    const endValue = recentHistory[recentHistory.length - 1].value
    const daysDiff = getDaysBetween(recentHistory[0].date, recentHistory[recentHistory.length - 1].date)

    if (daysDiff === 0) return null

    const dailyVelocity = (endValue - startValue) / daysDiff
    const daysRemaining = Math.max(0, getDaysBetween(new Date().toISOString().split('T')[0], goal.endDate))
    const projectedValue = goal.currentValue + (dailyVelocity * daysRemaining)

    return {
      dailyVelocity,
      weeklyVelocity: dailyVelocity * 7,
      projectedFinalValue: projectedValue,
      willAchieve: projectedValue >= goal.targetValue,
      daysToTarget: dailyVelocity > 0
        ? Math.ceil((goal.targetValue - goal.currentValue) / dailyVelocity)
        : null
    }
  }, [goals])

  return {
    // Data
    goals,
    templates,
    insights,
    dashboard,
    loading,
    error,

    // CRUD Operations
    createGoal,
    updateGoal,
    deleteGoal,
    recordProgress,

    // Milestone operations
    addMilestone,
    achieveMilestone,

    // Template operations
    createGoalFromTemplate,
    getTemplatesForUserType,

    // Analysis
    getBenchmark,
    getProgressVelocity,

    // Refresh
    refresh: fetchGoals
  }
}

// Helper functions
function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function calculatePercentile(value: number, benchmarks: { poor: number; average: number; good: number; excellent: number }): number {
  if (value >= benchmarks.excellent) return 95
  if (value >= benchmarks.good) return 75 + ((value - benchmarks.good) / (benchmarks.excellent - benchmarks.good)) * 20
  if (value >= benchmarks.average) return 50 + ((value - benchmarks.average) / (benchmarks.good - benchmarks.average)) * 25
  if (value >= benchmarks.poor) return 25 + ((value - benchmarks.poor) / (benchmarks.average - benchmarks.poor)) * 25
  return Math.max(0, (value / benchmarks.poor) * 25)
}

export default useKPIGoals
